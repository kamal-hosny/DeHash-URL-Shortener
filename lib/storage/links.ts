import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { Link } from "@/store/linkStore";
import { generateShortCode } from "@/lib/utils";
import {
  getCachedLink,
  setCachedLink,
  invalidateCachedLink,
  purgeCachedLink,
  incrementCachedClicks,
  getCachedClicks,
  recordAnalyticsInRedis,
  getLinkAnalyticsBreakdown,
} from "@/lib/redis/links-cache";
import { ClickMetadata } from "@/lib/analytics/tracker";
import { getDb } from "@/lib/db/client";
import { shortLinks, users, linkAnalytics } from "@/lib/db/schema";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "links.json");

export function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Helper to safely get local file backup links
async function getLocalBackupLinks(): Promise<Link[]> {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to safely save local file backup
async function saveLocalBackup(links: Link[]): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(links, null, 2), "utf-8");
  } catch (e) {
    console.warn("Local file backup warning:", e);
  }
}

/**
 * Retrieves stored links from Neon PostgreSQL and synchronizes legacy links from local backup.
 */
export async function getStoredLinks(userId?: string): Promise<Link[]> {
  const localBackup = await getLocalBackupLinks();

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();

      // 1. Auto-sync any legacy links from localBackup into Neon DB if not present
      for (const local of localBackup) {
        try {
          const exists = await db.query.shortLinks.findFirst({
            where: eq(shortLinks.shortCode, local.shortCode),
          });
          if (!exists) {
            let targetUserId = userId;
            if (!targetUserId || !isValidUUID(targetUserId)) {
              const firstUser = await db.query.users.findFirst();
              targetUserId = firstUser?.id;
            }
            if (targetUserId && isValidUUID(targetUserId)) {
              const originalUrlHash = crypto
                .createHash("sha256")
                .update(local.originalUrl)
                .digest("hex");
              await db
                .insert(shortLinks)
                .values({
                  userId: targetUserId,
                  originalUrl: local.originalUrl,
                  originalUrlHash,
                  shortCode: local.shortCode,
                  isActive: local.isActive ?? true,
                  createdAt: new Date(local.createdAt || Date.now()),
                })
                .onConflictDoNothing();
            }
          }
        } catch {
          // Ignore individual sync errors
        }
      }

      // 2. Fetch rows from Neon PostgreSQL safely
      let targetUserId = userId;
      if (targetUserId && !isValidUUID(targetUserId)) {
        const userFound = await db.query.users.findFirst({
          where: eq(users.email, targetUserId.toLowerCase().trim()),
        });
        targetUserId = userFound?.id;
      }

      const rows = targetUserId && isValidUUID(targetUserId)
        ? await db.query.shortLinks.findMany({
            where: eq(shortLinks.userId, targetUserId),
            orderBy: [desc(shortLinks.createdAt)],
          })
        : !userId
        ? await db.query.shortLinks.findMany({
            orderBy: [desc(shortLinks.createdAt)],
          })
        : [];

      if (rows) {
        if (rows.length === 0) {
          return [];
        }

        const linksWithClicks = await Promise.all(
          rows.map(async (r) => {
            const cachedClicks = await getCachedClicks(r.shortCode);
            const localMatch = localBackup.find(
              (l) => l.shortCode.toLowerCase() === r.shortCode.toLowerCase()
            );
            return {
              id: r.id,
              name: localMatch?.name,
              originalUrl: r.originalUrl,
              shortCode: r.shortCode,
              clicks: cachedClicks ?? localMatch?.clicks ?? 0,
              isActive: r.isActive,
              createdAt: r.createdAt.toISOString(),
            };
          })
        );
        return linksWithClicks;
      }
    } catch (dbErr) {
      console.warn("Neon DB getStoredLinks warning, using local fallback:", dbErr);
    }
  }

  return localBackup;
}

/**
 * Retrieves a link by its short code with multi-tier resolution:
 * 1. Redis Cache (Fast path < 5ms)
 * 2. Neon PostgreSQL (Primary source of truth)
 * 3. Local file backup (Offline fallback & auto-sync to DB/Redis)
 */
export async function getLinkByShortCode(shortCode: string): Promise<Link | null> {
  if (!shortCode) return null;
  const cleanCode = shortCode.trim();

  // Tier 1: Check Redis Cache
  try {
    const cached = await getCachedLink(cleanCode);
    if (cached) {
      return cached;
    }
  } catch (redisErr) {
    console.warn("Redis lookup error:", redisErr);
  }

  // Tier 2: Check Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const found = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.shortCode, cleanCode),
      });

      if (found) {
        const cachedClicks = await getCachedClicks(cleanCode);
        const link: Link = {
          id: found.id,
          originalUrl: found.originalUrl,
          shortCode: found.shortCode,
          clicks: cachedClicks ?? 0,
          isActive: found.isActive,
          createdAt: found.createdAt.toISOString(),
        };

        // Cache in Redis for subsequent requests
        await setCachedLink(link);
        return link;
      }
    } catch (dbErr) {
      console.warn("Neon DB lookup error:", dbErr);
    }
  }

  // Tier 3: Local file fallback & auto-sync
  const localLinks = await getLocalBackupLinks();
  const localFound = localLinks.find(
    (l) => l.shortCode.toLowerCase() === cleanCode.toLowerCase()
  );

  if (localFound) {
    // Populate Redis cache
    await setCachedLink(localFound);

    // Sync to Neon DB if not present
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        const firstUser = await db.query.users.findFirst();
        if (firstUser) {
          const originalUrlHash = crypto
            .createHash("sha256")
            .update(localFound.originalUrl)
            .digest("hex");
          await db
            .insert(shortLinks)
            .values({
              userId: firstUser.id,
              originalUrl: localFound.originalUrl,
              originalUrlHash,
              shortCode: localFound.shortCode,
              isActive: localFound.isActive ?? true,
              createdAt: new Date(localFound.createdAt || Date.now()),
            })
            .onConflictDoNothing();
        }
      } catch {
        // Ignore background sync error
      }
    }

    return localFound;
  }

  return null;
}

/**
 * Universal lookup by either shortCode, DB UUID, or local link ID.
 */
export async function getLinkByIdOrShortCode(identifier: string): Promise<Link | null> {
  if (!identifier) return null;
  const clean = identifier.trim();

  // 1. Direct shortCode match
  const byCode = await getLinkByShortCode(clean);
  if (byCode) return byCode;

  // 2. Check local backup by ID or shortCode
  const localBackup = await getLocalBackupLinks();
  const localMatch = localBackup.find(
    (l) => l.id === clean || l.shortCode.toLowerCase() === clean.toLowerCase()
  );
  if (localMatch) {
    await setCachedLink(localMatch);
    return localMatch;
  }

  // 3. Check DB by UUID id
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      if (isValidUUID(clean)) {
        const found = await db.query.shortLinks.findFirst({
          where: eq(shortLinks.id, clean),
        });
        if (found) {
          const cachedClicks = await getCachedClicks(found.shortCode);
          const link: Link = {
            id: found.id,
            originalUrl: found.originalUrl,
            shortCode: found.shortCode,
            clicks: cachedClicks ?? 0,
            isActive: found.isActive,
            createdAt: found.createdAt.toISOString(),
          };
          await setCachedLink(link);
          return link;
        }
      }
    } catch {
      // Ignore
    }
  }

  return null;
}


/**
 * Checks if a short code is already taken across Redis and Database.
 */
export async function isShortCodeTaken(shortCode: string): Promise<boolean> {
  const existing = await getLinkByShortCode(shortCode);
  return Boolean(existing);
}

/**
 * Generates a unique short code following the workflow:
 * Generate Code -> Check Database & Redis -> Exists? Yes: Generate Again / No: Save
 */
export async function generateUniqueShortCode(
  length: number = 6,
  maxAttempts: number = 10
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    // 1. Generate Code
    const code = generateShortCode(length);

    // 2. Check Database & Redis
    const exists = await isShortCodeTaken(code);

    // 3. Exists?
    // No -> Return unique code to be saved
    if (!exists) {
      return code;
    }

    // Yes -> Loop and Generate Again
    attempts++;
  }

  throw new Error(
    "Failed to generate a unique short code after multiple attempts. Please try again."
  );
}

/**
 * Saves a link to Neon PostgreSQL, caches it in Redis, and updates local backup.
 */
export async function saveLink(newLink: Link, userId?: string): Promise<Link> {
  // 1. Persist to Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      let targetUserId = userId;

      if (targetUserId && !isValidUUID(targetUserId)) {
        const userFound = await db.query.users.findFirst({
          where: eq(users.email, targetUserId.toLowerCase().trim()),
        });
        targetUserId = userFound?.id;
      }

      if (!targetUserId || !isValidUUID(targetUserId)) {
        const firstUser = await db.query.users.findFirst();
        if (firstUser) {
          targetUserId = firstUser.id;
        }
      }

      if (targetUserId && isValidUUID(targetUserId)) {
        const originalUrlHash = crypto
          .createHash("sha256")
          .update(newLink.originalUrl)
          .digest("hex");

        await db
          .insert(shortLinks)
          .values({
            userId: targetUserId,
            originalUrl: newLink.originalUrl,
            originalUrlHash,
            shortCode: newLink.shortCode,
            isActive: newLink.isActive ?? true,
          })
          .onConflictDoUpdate({
            target: shortLinks.shortCode,
            set: {
              originalUrl: newLink.originalUrl,
              originalUrlHash,
              isActive: newLink.isActive ?? true,
              updatedAt: new Date(),
            },
          });
      }
    } catch (dbErr) {
      console.warn("Neon DB saveLink warning:", dbErr);
    }
  }

  // 2. Cache in Redis
  try {
    await setCachedLink(newLink);
  } catch (redisErr) {
    console.warn("Redis setCachedLink warning:", redisErr);
  }

  // 3. Keep local backup in sync
  try {
    const local = await getLocalBackupLinks();
    const existingIndex = local.findIndex(
      (l) => l.shortCode.toLowerCase() === newLink.shortCode.toLowerCase()
    );
    let updated: Link[];
    if (existingIndex >= 0) {
      updated = [...local];
      updated[existingIndex] = { ...updated[existingIndex], ...newLink };
    } else {
      updated = [newLink, ...local];
    }
    await saveLocalBackup(updated);
  } catch (localErr) {
    console.warn("Local backup sync warning:", localErr);
  }

  return newLink;
}

/**
 * Records link clicks atomically in Redis and logs analytics to Neon DB.
 */
export async function recordLinkClick(
  shortCode: string,
  metadata?: ClickMetadata
): Promise<void> {
  if (!shortCode) return;
  const cleanCode = shortCode.trim();

  // 1. Atomic increment and breakdown in Redis (Fast path < 5ms)
  try {
    await incrementCachedClicks(cleanCode);
    if (metadata) {
      await recordAnalyticsInRedis(cleanCode, {
        ipAddress: metadata.ipAddress,
        country: metadata.country,
        city: metadata.city,
        deviceType: metadata.deviceType,
        browser: metadata.browser,
        referrer: metadata.referrer,
      });
    }
  } catch (redisErr) {
    console.warn("Redis click increment warning:", redisErr);
  }

  // 2. Record detailed analytics event in Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      let found = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.shortCode, cleanCode),
      });

      // If link not yet in Neon DB, auto-create it from local backup or fallback
      if (!found) {
        const localBackup = await getLocalBackupLinks();
        const localMatch = localBackup.find(
          (l) => l.shortCode.toLowerCase() === cleanCode.toLowerCase()
        );
        const firstUser = await db.query.users.findFirst();
        if (firstUser && localMatch) {
          const originalUrlHash = crypto
            .createHash("sha256")
            .update(localMatch.originalUrl)
            .digest("hex");
          const inserted = await db
            .insert(shortLinks)
            .values({
              userId: firstUser.id,
              originalUrl: localMatch.originalUrl,
              originalUrlHash,
              shortCode: localMatch.shortCode,
              isActive: localMatch.isActive ?? true,
            })
            .returning();
          found = inserted[0];
        }
      }

      if (found) {
        await db.insert(linkAnalytics).values({
          linkId: found.id,
          referrer: metadata?.referrer || null,
          country: metadata?.country || null,
          city: metadata?.city || null,
          deviceType: metadata?.deviceType || null,
          browser: metadata?.browser || null,
          ipAddress: metadata?.ipAddress || null,
          userAgent: metadata?.userAgent || null,
          clickedAt: new Date(),
        });
      }
    } catch (dbErr) {
      console.warn("Neon DB recordLinkClick analytics warning:", dbErr);
    }
  }

  // 3. Sync click count in local backup
  try {
    const local = await getLocalBackupLinks();
    const link = local.find(
      (l) => l.shortCode.toLowerCase() === cleanCode.toLowerCase()
    );
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      await saveLocalBackup(local);
    }
  } catch {
    // Ignore local backup click errors
  }
}

/**
 * Retrieves comprehensive aggregated and individual analytics for a short link.
 */
export async function getLinkAnalyticsData(shortCode: string) {
  if (!shortCode) return null;
  const cleanCode = shortCode.trim();

  // 1. Fetch pre-aggregated breakdown from Redis
  const redisBreakdown = await getLinkAnalyticsBreakdown(cleanCode);

  // 2. Query Neon PostgreSQL for historical events
  let dbEvents: Array<{
    id: string;
    clickedAt: Date;
    referrer: string | null;
    country: string | null;
    city: string | null;
    deviceType: string | null;
    browser: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const link = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.shortCode, cleanCode),
      });

      if (link) {
        dbEvents = await db.query.linkAnalytics.findMany({
          where: eq(linkAnalytics.linkId, link.id),
          orderBy: [desc(linkAnalytics.clickedAt)],
          limit: 100,
        });
      }
    } catch (err) {
      console.warn("Neon DB getLinkAnalyticsData error:", err);
    }
  }

  // Compute stats from DB events
  const dbCountryMap: Record<string, number> = {};
  const dbDeviceMap: Record<string, number> = {};
  const dbBrowserMap: Record<string, number> = {};
  const dbReferrerMap: Record<string, number> = {};
  const dbUniqueIps = new Set<string>();

  dbEvents.forEach((e) => {
    if (e.ipAddress) dbUniqueIps.add(e.ipAddress);
    if (e.country) dbCountryMap[e.country] = (dbCountryMap[e.country] || 0) + 1;
    if (e.deviceType) dbDeviceMap[e.deviceType] = (dbDeviceMap[e.deviceType] || 0) + 1;
    if (e.browser) dbBrowserMap[e.browser] = (dbBrowserMap[e.browser] || 0) + 1;
    if (e.referrer) dbReferrerMap[e.referrer] = (dbReferrerMap[e.referrer] || 0) + 1;
  });

  // Merge Redis and DB stats (take max for each counter to prevent undercounting)
  const totalClicks = Math.max(dbEvents.length, redisBreakdown?.totalClicks || 0);
  const uniqueVisitors = Math.max(
    dbUniqueIps.size,
    redisBreakdown?.uniqueVisitors || (totalClicks > 0 ? 1 : 0)
  );

  const countryMap: Record<string, number> = { ...(redisBreakdown?.countries || {}) };
  Object.entries(dbCountryMap).forEach(([k, v]) => {
    countryMap[k] = Math.max(countryMap[k] || 0, v);
  });

  const deviceMap: Record<string, number> = { ...(redisBreakdown?.devices || {}) };
  Object.entries(dbDeviceMap).forEach(([k, v]) => {
    deviceMap[k] = Math.max(deviceMap[k] || 0, v);
  });

  const browserMap: Record<string, number> = { ...(redisBreakdown?.browsers || {}) };
  Object.entries(dbBrowserMap).forEach(([k, v]) => {
    browserMap[k] = Math.max(browserMap[k] || 0, v);
  });

  const referrerMap: Record<string, number> = { ...(redisBreakdown?.referrers || {}) };
  Object.entries(dbReferrerMap).forEach(([k, v]) => {
    referrerMap[k] = Math.max(referrerMap[k] || 0, v);
  });

  const locationData = Object.entries(countryMap)
    .filter(([label]) => label && label !== "Unknown")
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  if (locationData.length === 0 && totalClicks > 0) {
    const unknownCount = countryMap["Unknown"] || totalClicks;
    locationData.push({ label: "Other / Direct", value: unknownCount });
  }

  const deviceData = Object.entries(deviceMap)
    .map(([label, value]) => ({
      label,
      value,
      color: label === "Desktop" ? "#3b82f6" : label === "Mobile" ? "#8b5cf6" : "#10b981",
    }))
    .sort((a, b) => b.value - a.value);

  const browserColors: Record<string, string> = {
    Chrome: "#f59e0b",
    Safari: "#06b6d4",
    Firefox: "#ec4899",
    Edge: "#6366f1",
    Opera: "#ef4444",
  };

  const browserData = Object.entries(browserMap)
    .map(([label, value]) => ({
      label,
      value,
      color: browserColors[label] || "#a855f7",
    }))
    .sort((a, b) => b.value - a.value);

  const referrerData = Object.entries(referrerMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const recentClicks = dbEvents.slice(0, 20).map((e) => ({
    id: e.id,
    clickedAt: e.clickedAt.toISOString(),
    country: e.country,
    city: e.city,
    referrer: e.referrer,
    deviceType: e.deviceType,
    browser: e.browser,
    ipAddress: e.ipAddress,
  }));

  return {
    totalClicks,
    uniqueVisitors,
    locationData,
    deviceData,
    browserData,
    referrerData,
    recentClicks,
  };
}

/**
 * Deletes a link by its ID or shortCode across Neon DB, Redis cache, and Local file backup.
 */
export async function deleteStoredLink(idOrCode: string): Promise<boolean> {
  if (!idOrCode) return false;
  const cleanIdOrCode = idOrCode.trim();

  let targetShortCode: string | null = null;
  let targetDbId: string | null = null;
  let targetLocalId: string | null = null;

  // Step 1: Check local backup to resolve localId and shortCode
  const localBackup = await getLocalBackupLinks();
  const localMatch = localBackup.find(
    (l) => l.id === cleanIdOrCode || l.shortCode.toLowerCase() === cleanIdOrCode.toLowerCase()
  );
  if (localMatch) {
    targetLocalId = localMatch.id;
    targetShortCode = localMatch.shortCode;
  }

  // Step 2: Check Neon DB and delete if present
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      let dbMatch = null;

      if (isValidUUID(cleanIdOrCode)) {
        dbMatch = await db.query.shortLinks.findFirst({
          where: eq(shortLinks.id, cleanIdOrCode),
        });
      }

      if (!dbMatch && targetShortCode) {
        dbMatch = await db.query.shortLinks.findFirst({
          where: eq(shortLinks.shortCode, targetShortCode),
        });
      }

      if (!dbMatch) {
        dbMatch = await db.query.shortLinks.findFirst({
          where: eq(shortLinks.shortCode, cleanIdOrCode),
        });
      }

      if (dbMatch) {
        targetDbId = dbMatch.id;
        targetShortCode = dbMatch.shortCode;

        // Delete associated analytics from DB first
        try {
          await db.delete(linkAnalytics).where(eq(linkAnalytics.linkId, dbMatch.id));
        } catch (analyticsErr) {
          console.warn("Neon DB delete linkAnalytics warning:", analyticsErr);
        }

        // Delete short link from DB
        await db.delete(shortLinks).where(eq(shortLinks.id, dbMatch.id));
      }
    } catch (err) {
      console.warn("Neon DB delete link error:", err);
    }
  }

  const finalShortCode = targetShortCode || cleanIdOrCode;

  // Step 3: Purge from Redis cache
  try {
    await purgeCachedLink(finalShortCode);
  } catch (err) {
    console.warn("Redis purge error:", err);
  }

  // Step 4: Delete from local file backup permanently
  try {
    const backup = await getLocalBackupLinks();
    const updated = backup.filter((l) => {
      if (l.id === cleanIdOrCode) return false;
      if (targetLocalId && l.id === targetLocalId) return false;
      if (targetDbId && l.id === targetDbId) return false;
      if (l.shortCode.toLowerCase() === cleanIdOrCode.toLowerCase()) return false;
      if (finalShortCode && l.shortCode.toLowerCase() === finalShortCode.toLowerCase()) return false;
      return true;
    });
    await saveLocalBackup(updated);
  } catch (err) {
    console.warn("Local backup delete error:", err);
  }

  return true;
}


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
  incrementCachedClicks,
} from "@/lib/redis/links-cache";
import { getDb } from "@/lib/db/client";
import { shortLinks, users, linkAnalytics } from "@/lib/db/schema";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "links.json");

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
 * Retrieves stored links from Neon PostgreSQL, fallback to local backup if DB offline.
 */
export async function getStoredLinks(userId?: string): Promise<Link[]> {
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const rows = userId
        ? await db.query.shortLinks.findMany({
            where: eq(shortLinks.userId, userId),
            orderBy: [desc(shortLinks.createdAt)],
          })
        : await db.query.shortLinks.findMany({
            orderBy: [desc(shortLinks.createdAt)],
          });

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          originalUrl: r.originalUrl,
          shortCode: r.shortCode,
          clicks: 0,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (dbErr) {
      console.warn("Neon DB getStoredLinks warning, using local fallback:", dbErr);
    }
  }

  return await getLocalBackupLinks();
}

/**
 * Retrieves a link by its short code with multi-tier resolution:
 * 1. Redis Cache (Fast path < 5ms)
 * 2. Neon PostgreSQL (Primary source of truth)
 * 3. Local file backup (Offline fallback)
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
        const link: Link = {
          id: found.id,
          originalUrl: found.originalUrl,
          shortCode: found.shortCode,
          clicks: 0,
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

  // Tier 3: Local file fallback
  const localLinks = await getLocalBackupLinks();
  const localFound = localLinks.find(
    (l) => l.shortCode.toLowerCase() === cleanCode.toLowerCase()
  );

  if (localFound) {
    // Populate Redis cache
    await setCachedLink(localFound);
    return localFound;
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

    // 3. هل موجود؟
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

      if (!targetUserId) {
        const firstUser = await db.query.users.findFirst();
        if (firstUser) {
          targetUserId = firstUser.id;
        }
      }

      if (targetUserId) {
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
  metadata?: { referrer?: string; ipAddress?: string; userAgent?: string }
): Promise<void> {
  if (!shortCode) return;

  // 1. Atomic increment in Redis (Fast path)
  try {
    await incrementCachedClicks(shortCode);
  } catch (redisErr) {
    console.warn("Redis click increment warning:", redisErr);
  }

  // 2. Record analytics in Neon PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      const found = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.shortCode, shortCode),
      });

      if (found) {
        await db.insert(linkAnalytics).values({
          linkId: found.id,
          referrer: metadata?.referrer || null,
          ipAddress: metadata?.ipAddress || null,
          userAgent: metadata?.userAgent || null,
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
      (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
    );
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      await saveLocalBackup(local);
    }
  } catch (e) {
    // Ignore local backup click errors
  }
}

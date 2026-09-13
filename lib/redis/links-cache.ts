import { redis } from "./client";
import { Link } from "@/store/linkStore";

const LINK_PREFIX = "link:";
const CLICKS_PREFIX = "clicks:";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Retrieves a link from Redis cache in O(1) time.
 */
export async function getCachedLink(shortCode: string): Promise<Link | null> {
  if (!shortCode) return null;
  try {
    const raw = await redis.get<Link | string>(`${LINK_PREFIX}${shortCode.toLowerCase()}`);
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as Link;
      } catch {
        return null;
      }
    }
    return raw as Link;
  } catch (error) {
    console.warn("Redis getCachedLink warning:", error);
    return null;
  }
}

/**
 * Caches a link in Redis with an expiration time.
 */
export async function setCachedLink(
  link: Link,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  if (!link || !link.shortCode) return;
  try {
    const key = `${LINK_PREFIX}${link.shortCode.toLowerCase()}`;
    await redis.set(key, JSON.stringify(link), { ex: ttlSeconds });
  } catch (error) {
    console.warn("Redis setCachedLink warning:", error);
  }
}

/**
 * Removes a link from Redis cache.
 */
export async function invalidateCachedLink(shortCode: string): Promise<void> {
  if (!shortCode) return;
  try {
    await redis.del(`${LINK_PREFIX}${shortCode.toLowerCase()}`);
  } catch (error) {
    console.warn("Redis invalidateCachedLink warning:", error);
  }
}

/**
 * Atomically increments clicks in Redis and syncs cached link clicks.
 */
export async function incrementCachedClicks(shortCode: string): Promise<number> {
  if (!shortCode) return 0;
  try {
    const key = `${CLICKS_PREFIX}${shortCode.toLowerCase()}`;
    const count = await redis.incr(key);

    const cached = await getCachedLink(shortCode);
    if (cached) {
      cached.clicks = (cached.clicks || 0) + 1;
      await setCachedLink(cached);
    }

    return count;
  } catch (error) {
    console.warn("Redis incrementCachedClicks warning:", error);
    return 0;
  }
}

/**
 * Gets the current cached clicks for a shortCode.
 */
export async function getCachedClicks(shortCode: string): Promise<number | null> {
  if (!shortCode) return null;
  try {
    const key = `${CLICKS_PREFIX}${shortCode.toLowerCase()}`;
    const raw = await redis.get<number>(key);
    return raw !== null ? Number(raw) : null;
  } catch (error) {
    console.warn("Redis getCachedClicks warning:", error);
    return null;
  }
}

/**
 * Records aggregated analytics counters in Redis for ultra-fast dashboard queries.
 */
export async function recordAnalyticsInRedis(
  shortCode: string,
  metadata: {
    ipAddress?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    referrer?: string;
  }
): Promise<void> {
  if (!shortCode) return;
  const code = shortCode.toLowerCase();
  try {
    const pipeline = redis.pipeline();

    if (metadata.ipAddress) {
      pipeline.sadd(`analytics:${code}:ips`, metadata.ipAddress);
    }
    if (metadata.country) {
      pipeline.hincrby(`analytics:${code}:countries`, metadata.country, 1);
    }
    if (metadata.city && metadata.city !== "Unknown") {
      pipeline.hincrby(`analytics:${code}:cities`, metadata.city, 1);
    }
    if (metadata.deviceType) {
      pipeline.hincrby(`analytics:${code}:devices`, metadata.deviceType, 1);
    }
    if (metadata.browser) {
      pipeline.hincrby(`analytics:${code}:browsers`, metadata.browser, 1);
    }
    if (metadata.referrer) {
      pipeline.hincrby(`analytics:${code}:referrers`, metadata.referrer, 1);
    }

    await pipeline.exec();
  } catch (error) {
    console.warn("Redis recordAnalyticsInRedis warning:", error);
  }
}

/**
 * Retrieves aggregated analytics breakdown for a short code from Redis.
 */
export async function getLinkAnalyticsBreakdown(shortCode: string) {
  if (!shortCode) return null;
  const code = shortCode.toLowerCase();
  try {
    const [countries, cities, devices, browsers, referrers, totalClicks, uniqueIps] =
      await Promise.all([
        redis.hgetall<Record<string, number>>(`analytics:${code}:countries`),
        redis.hgetall<Record<string, number>>(`analytics:${code}:cities`),
        redis.hgetall<Record<string, number>>(`analytics:${code}:devices`),
        redis.hgetall<Record<string, number>>(`analytics:${code}:browsers`),
        redis.hgetall<Record<string, number>>(`analytics:${code}:referrers`),
        getCachedClicks(code),
        redis.scard(`analytics:${code}:ips`),
      ]);

    return {
      totalClicks: totalClicks || 0,
      uniqueVisitors: uniqueIps || 0,
      countries: countries || {},
      cities: cities || {},
      devices: devices || {},
      browsers: browsers || {},
      referrers: referrers || {},
    };
  } catch (error) {
    console.warn("Redis getLinkAnalyticsBreakdown warning:", error);
    return null;
  }
}


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


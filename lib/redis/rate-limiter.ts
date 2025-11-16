import { redis } from "./client";

const PLAN_LIMITS = {
  FREE: 50,
  PRO: 1000,
} as const;


export async function checkQuota(userId: number, plan: "FREE" | "PRO") {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rawValue = await redis.get(monthKey);
  const current = Number(rawValue ?? 0);

  const limit = PLAN_LIMITS[plan];

  if (current >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
    };
  }

  return {
    allowed: true,
    remaining: limit - current - 1,
    limit,
  };
}


export async function incrementQuota(userId: number) {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  await redis.incr(monthKey);

  // expiration to end of month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const secondsUntilEndOfMonth = Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);

  await redis.expire(monthKey, secondsUntilEndOfMonth);
}

export async function getQuotaUsage(userId: number) {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rawValue = await redis.get(monthKey);
  return Number(rawValue ?? 0);
}

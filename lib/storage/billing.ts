import { getDb } from "@/lib/db/client";
import { users, coupons, invoices, userSubscriptions } from "@/lib/db/schema";
import { eq, desc, or, sql } from "drizzle-orm";
import { getStoredLinks, isValidUUID } from "@/lib/storage/links";

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // e.g. 100 for 100%
  description?: string;
  applicableCycle?: "all" | "monthly" | "yearly";
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  userEmail?: string;
  plan: "PRO" | "ENTERPRISE" | "FREE" | "TOPUP";
  amount: number; // e.g. 0 or 12
  originalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status: "paid" | "pending" | "failed";
  createdAt: string;
}

export interface UserSubscriptionInfo {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "active" | "canceled" | "past_due";
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  cycleStartDate?: string;
  cycleEndDate?: string;
  daysRemaining?: number;
  allocatedQuota: number;
  priorLinksCount: number;
  cycleUsedCount: number;
  remainingInCycle: number;
  isCapReached: boolean;
  maxCap: number;
  usage: {
    links: number;
    limit: number;
    percentage: number;
  };
}

export interface StoredSubscription {
  userId: string;
  userEmail?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "active" | "canceled";
  billingCycle: "monthly" | "yearly";
  cycleStartDate: string;
  cycleEndDate: string;
  allocatedQuota: number;
  priorLinksCount: number;
  updatedAt: string;
}

// ==========================================
// COUPONS API (Neon PostgreSQL backed)
// ==========================================

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const db = getDb();
    const rows = await db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)],
    });

    return rows.map((c) => ({
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent,
      description: c.description || undefined,
      applicableCycle: (c.applicableCycle as "all" | "monthly" | "yearly") || "all",
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching coupons from DB:", err);
    return [];
  }
}

export async function createCoupon(data: {
  code: string;
  discountPercent: number;
  applicableCycle?: "all" | "monthly" | "yearly";
  description?: string;
  maxUses?: number | null;
  expiresAt?: string | null;
}): Promise<Coupon> {
  const db = getDb();
  const normalizedCode = data.code.trim().toUpperCase();

  const existing = await db.query.coupons.findFirst({
    where: eq(coupons.code, normalizedCode),
  });

  if (existing) {
    throw new Error(`Coupon with code "${normalizedCode}" already exists`);
  }

  const inserted = await db
    .insert(coupons)
    .values({
      code: normalizedCode,
      discountPercent: Math.min(Math.max(Number(data.discountPercent), 1), 100),
      description: data.description?.trim() || `${data.discountPercent}% Discount`,
      applicableCycle: data.applicableCycle || "all",
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      usedCount: 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: true,
    })
    .returning();

  const c = inserted[0];
  return {
    id: c.id,
    code: c.code,
    discountPercent: c.discountPercent,
    description: c.description || undefined,
    applicableCycle: (c.applicableCycle as "all" | "monthly" | "yearly") || "all",
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function deleteCoupon(idOrCode: string): Promise<boolean> {
  try {
    const db = getDb();
    const clean = idOrCode.trim();
    const isUuid = isValidUUID(clean);

    let result;
    if (isUuid) {
      result = await db.delete(coupons).where(eq(coupons.id, clean)).returning();
    } else {
      result = await db.delete(coupons).where(eq(coupons.code, clean.toUpperCase())).returning();
    }

    return result.length > 0;
  } catch (err) {
    console.error("Error deleting coupon from DB:", err);
    return false;
  }
}

export async function validateCoupon(
  code: string,
  billingCycle?: "monthly" | "yearly"
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  if (!code) return { valid: false, error: "Please enter a coupon code" };
  const normalized = code.trim().toUpperCase();

  const db = getDb();
  const c = await db.query.coupons.findFirst({
    where: eq(coupons.code, normalized),
  });

  if (!c || !c.isActive) {
    return { valid: false, error: "Invalid or inactive discount code" };
  }

  const mappedCoupon: Coupon = {
    id: c.id,
    code: c.code,
    discountPercent: c.discountPercent,
    description: c.description || undefined,
    applicableCycle: (c.applicableCycle as "all" | "monthly" | "yearly") || "all",
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };

  // Check billing cycle compatibility if specified
  if (billingCycle && mappedCoupon.applicableCycle && mappedCoupon.applicableCycle !== "all") {
    if (mappedCoupon.applicableCycle !== billingCycle) {
      const allowedCycleLabel =
        mappedCoupon.applicableCycle === "yearly"
          ? "Yearly Subscription ($9/mo billed annually)"
          : "Monthly Subscription ($12/mo)";
      const currentCycleLabel =
        billingCycle === "yearly" ? "Yearly" : "Monthly";

      return {
        valid: false,
        error: `This coupon code is valid ONLY for ${allowedCycleLabel}. You currently have ${currentCycleLabel} selected. Please switch your plan cycle to use this code.`,
      };
    }
  }

  if (c.maxUses && c.usedCount >= c.maxUses) {
    return { valid: false, error: "This coupon code has reached its maximum usage limit" };
  }

  if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return { valid: false, error: "This coupon code has expired" };
  }

  return { valid: true, coupon: mappedCoupon };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const db = getDb();
    const normalized = code.trim().toUpperCase();
    await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.code, normalized));
  } catch (err) {
    console.warn("Failed to increment coupon usage in DB:", err);
  }
}

// ==========================================
// INVOICES API (Neon PostgreSQL backed)
// ==========================================

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const db = getDb();
    const rows = await db.query.invoices.findMany({
      orderBy: [desc(invoices.createdAt)],
    });

    return rows.map((inv) => ({
      id: inv.id,
      userId: inv.userId,
      userEmail: inv.userEmail || undefined,
      plan: inv.plan as "PRO" | "ENTERPRISE" | "FREE",
      amount: inv.amount,
      originalAmount: inv.originalAmount,
      discountAmount: inv.discountAmount,
      couponCode: inv.couponCode || null,
      status: inv.status as "paid" | "pending" | "failed",
      createdAt: inv.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Error reading invoices from DB:", err);
    return [];
  }
}

export async function getUserInvoices(userId?: string, userEmail?: string): Promise<Invoice[]> {
  try {
    const db = getDb();
    if (!userId && !userEmail) {
      return getInvoices();
    }

    const conditions = [];
    if (userId) {
      conditions.push(eq(invoices.userId, userId));
    }
    if (userEmail) {
      conditions.push(eq(invoices.userEmail, userEmail.toLowerCase().trim()));
    }

    const rows = await db.query.invoices.findMany({
      where: conditions.length === 1 ? conditions[0] : or(...conditions),
      orderBy: [desc(invoices.createdAt)],
    });

    return rows.map((inv) => ({
      id: inv.id,
      userId: inv.userId,
      userEmail: inv.userEmail || undefined,
      plan: inv.plan as "PRO" | "ENTERPRISE" | "FREE" | "TOPUP",
      amount: inv.amount,
      originalAmount: inv.originalAmount,
      discountAmount: inv.discountAmount,
      couponCode: inv.couponCode || null,
      status: inv.status as "paid" | "pending" | "failed",
      createdAt: inv.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Error reading user invoices from DB:", err);
    return [];
  }
}

export async function createInvoice(data: {
  userId: string;
  userEmail?: string;
  plan: "PRO" | "ENTERPRISE" | "FREE" | "TOPUP";
  amount: number;
  originalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status?: "paid" | "pending" | "failed";
}): Promise<Invoice> {
  const db = getDb();
  const id = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const inserted = await db
    .insert(invoices)
    .values({
      id,
      userId: data.userId,
      userEmail: data.userEmail ? data.userEmail.toLowerCase().trim() : null,
      plan: data.plan,
      amount: data.amount,
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount,
      couponCode: data.couponCode || null,
      status: data.status || "paid",
      createdAt: new Date(),
    })
    .returning();

  const inv = inserted[0];
  return {
    id: inv.id,
    userId: inv.userId,
    userEmail: inv.userEmail || undefined,
    plan: inv.plan as "PRO" | "ENTERPRISE" | "FREE" | "TOPUP",
    amount: inv.amount,
    originalAmount: inv.originalAmount,
    discountAmount: inv.discountAmount,
    couponCode: inv.couponCode || null,
    status: inv.status as "paid" | "pending" | "failed",
    createdAt: inv.createdAt.toISOString(),
  };
}

// ==========================================
// SUBSCRIPTIONS & QUOTA API (Neon PostgreSQL backed)
// ==========================================

async function getStoredSubscriptionRow(userId?: string, userEmail?: string) {
  if (!userId && !userEmail) return null;
  const db = getDb();
  const conditions = [];
  if (userId) conditions.push(eq(userSubscriptions.userId, userId));
  if (userEmail) conditions.push(eq(userSubscriptions.userEmail, userEmail.toLowerCase().trim()));

  return db.query.userSubscriptions.findFirst({
    where: conditions.length === 1 ? conditions[0] : or(...conditions),
  });
}

export async function updateUserPlan(
  userId: string,
  userEmail: string | undefined,
  plan: "FREE" | "PRO" | "ENTERPRISE",
  options?: {
    billingCycle?: "monthly" | "yearly";
    isTopUp?: boolean;
    topUpPoints?: number;
  }
): Promise<StoredSubscription> {
  const db = getDb();

  // 1. Update user's subscriptionPlan in users table
  if (isValidUUID(userId)) {
    await db
      .update(users)
      .set({ subscriptionPlan: plan })
      .where(eq(users.id, userId));
  } else if (userEmail) {
    await db
      .update(users)
      .set({ subscriptionPlan: plan })
      .where(eq(users.email, userEmail.toLowerCase().trim()));
  }

  // 2. Fetch existing user links to guarantee Zero-Penalty Upgrade
  const existingLinks = await getStoredLinks(userId);
  const existingSub = await getStoredSubscriptionRow(userId, userEmail);

  const now = new Date();
  const cycleEnd = new Date(now);
  cycleEnd.setDate(cycleEnd.getDate() + 30);

  const billingCycle =
    options?.billingCycle ||
    existingSub?.billingCycle ||
    "monthly";
  const defaultQuota = billingCycle === "yearly" ? 2000 : 1000;

  let targetSubData: {
    userId: string;
    userEmail: string | null;
    plan: "FREE" | "PRO" | "ENTERPRISE";
    status: "active" | "canceled";
    billingCycle: string;
    cycleStartDate: Date;
    cycleEndDate: Date;
    allocatedQuota: number;
    priorLinksCount: number;
    updatedAt: Date;
  };

  if (plan === "FREE") {
    targetSubData = {
      userId,
      userEmail: userEmail?.toLowerCase().trim() || null,
      plan: "FREE",
      status: "active",
      billingCycle: "monthly",
      cycleStartDate: now,
      cycleEndDate: cycleEnd,
      allocatedQuota: 50,
      priorLinksCount: 0,
      updatedAt: now,
    };
  } else {
    // PRO or ENTERPRISE
    if (options?.isTopUp && existingSub) {
      const currentQuota = existingSub.allocatedQuota || defaultQuota;
      const pointsToAdd = options.topUpPoints ?? 1000;
      const newQuota = Math.min(currentQuota + pointsToAdd, 10000);

      targetSubData = {
        userId,
        userEmail: userEmail?.toLowerCase().trim() || existingSub.userEmail,
        plan,
        status: "active",
        billingCycle: existingSub.billingCycle,
        cycleStartDate: existingSub.cycleStartDate,
        cycleEndDate: existingSub.cycleEndDate,
        allocatedQuota: newQuota,
        priorLinksCount: existingSub.priorLinksCount,
        updatedAt: now,
      };
    } else {
      let allocatedQuota = defaultQuota;
      if (existingSub && existingSub.plan === "PRO") {
        allocatedQuota = Math.min(
          (existingSub.allocatedQuota || 0) + defaultQuota,
          10000
        );
      }

      targetSubData = {
        userId,
        userEmail: userEmail?.toLowerCase().trim() || null,
        plan,
        status: "active",
        billingCycle,
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        allocatedQuota,
        priorLinksCount: existingLinks.length, // Free/past links are preserved without reducing quota
        updatedAt: now,
      };
    }
  }

  // 3. Upsert into user_subscriptions table
  await db
    .insert(userSubscriptions)
    .values({
      userId: targetSubData.userId,
      userEmail: targetSubData.userEmail,
      plan: targetSubData.plan,
      status: targetSubData.status,
      billingCycle: targetSubData.billingCycle,
      cycleStartDate: targetSubData.cycleStartDate,
      cycleEndDate: targetSubData.cycleEndDate,
      allocatedQuota: targetSubData.allocatedQuota,
      priorLinksCount: targetSubData.priorLinksCount,
      updatedAt: targetSubData.updatedAt,
    })
    .onConflictDoUpdate({
      target: userSubscriptions.userId,
      set: {
        userEmail: targetSubData.userEmail,
        plan: targetSubData.plan,
        status: targetSubData.status,
        billingCycle: targetSubData.billingCycle,
        cycleStartDate: targetSubData.cycleStartDate,
        cycleEndDate: targetSubData.cycleEndDate,
        allocatedQuota: targetSubData.allocatedQuota,
        priorLinksCount: targetSubData.priorLinksCount,
        updatedAt: targetSubData.updatedAt,
      },
    });

  return {
    userId: targetSubData.userId,
    userEmail: targetSubData.userEmail || undefined,
    plan: targetSubData.plan,
    status: targetSubData.status,
    billingCycle: targetSubData.billingCycle as "monthly" | "yearly",
    cycleStartDate: targetSubData.cycleStartDate.toISOString(),
    cycleEndDate: targetSubData.cycleEndDate.toISOString(),
    allocatedQuota: targetSubData.allocatedQuota,
    priorLinksCount: targetSubData.priorLinksCount,
    updatedAt: targetSubData.updatedAt.toISOString(),
  };
}

export async function getUserSubscription(
  userId?: string,
  userEmail?: string,
  sessionPlan?: "FREE" | "PRO"
): Promise<UserSubscriptionInfo> {
  let activePlan: "FREE" | "PRO" | "ENTERPRISE" = sessionPlan || "FREE";
  const db = getDb();

  // 1. Fetch user record from Neon DB
  if (userId || userEmail) {
    try {
      const user = isValidUUID(userId)
        ? await db.query.users.findFirst({ where: eq(users.id, userId!) })
        : userEmail
        ? await db.query.users.findFirst({ where: eq(users.email, userEmail.toLowerCase().trim()) })
        : null;

      if (user?.subscriptionPlan) {
        activePlan = user.subscriptionPlan as "FREE" | "PRO" | "ENTERPRISE";
      }
    } catch (err) {
      console.warn("Neon DB getUserSubscription error:", err);
    }
  }

  // 2. Fetch user subscription record from DB
  const storedSub = await getStoredSubscriptionRow(userId, userEmail);
  if (storedSub && activePlan === "FREE" && storedSub.plan !== "FREE") {
    activePlan = storedSub.plan as "FREE" | "PRO" | "ENTERPRISE";
  }

  const allLinks = await getStoredLinks(userId);

  if (activePlan === "FREE") {
    const limit = 50;
    const linksCount = allLinks.length;
    const percentage = Math.min(Math.round((linksCount / limit) * 100), 100);

    return {
      plan: "FREE",
      status: "active",
      billingCycle: "monthly",
      nextBillingDate: "N/A",
      allocatedQuota: 50,
      priorLinksCount: 0,
      cycleUsedCount: linksCount,
      remainingInCycle: Math.max(limit - linksCount, 0),
      isCapReached: false,
      maxCap: 10000,
      usage: {
        links: linksCount,
        limit,
        percentage,
      },
    };
  }

  // User is PRO or ENTERPRISE
  const now = new Date();
  let currentSub = storedSub;

  if (!currentSub) {
    // Initialize standard subscription record in DB
    const cycleEnd = new Date(now);
    cycleEnd.setDate(cycleEnd.getDate() + 30);

    const inserted = await db
      .insert(userSubscriptions)
      .values({
        userId: userId || "user",
        userEmail: userEmail?.toLowerCase().trim() || null,
        plan: activePlan,
        status: "active",
        billingCycle: "monthly",
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        allocatedQuota: 1000,
        priorLinksCount: allLinks.length,
        updatedAt: now,
      })
      .returning();

    currentSub = inserted[0];
  } else {
    // Check 30-day expiration and auto-renewal in DB
    const cycleEndTime = new Date(currentSub.cycleEndDate).getTime();
    if (now.getTime() >= cycleEndTime) {
      const nextEnd = new Date(now);
      nextEnd.setDate(nextEnd.getDate() + 30);

      const refreshedQuota = currentSub.billingCycle === "yearly" ? 2000 : 1000;

      await db
        .update(userSubscriptions)
        .set({
          priorLinksCount: allLinks.length,
          cycleStartDate: now,
          cycleEndDate: nextEnd,
          allocatedQuota: refreshedQuota,
          updatedAt: now,
        })
        .where(eq(userSubscriptions.id, currentSub.id));

      currentSub = {
        ...currentSub,
        priorLinksCount: allLinks.length,
        cycleStartDate: now,
        cycleEndDate: nextEnd,
        allocatedQuota: refreshedQuota,
        updatedAt: now,
      };
    }
  }

  // Calculate links created ONLY during the current 30-day cycle
  const cycleStartTime = new Date(currentSub.cycleStartDate).getTime();
  const cycleLinks = allLinks.filter((l) => {
    const linkTime = new Date(l.createdAt).getTime();
    return !isNaN(linkTime) && linkTime >= cycleStartTime;
  });

  const cycleUsedCount = cycleLinks.length;
  const allocatedQuota = Math.min(
    currentSub.allocatedQuota || (currentSub.billingCycle === "yearly" ? 2000 : 1000),
    10000
  );
  const remainingInCycle = Math.max(allocatedQuota - cycleUsedCount, 0);

  const daysRemaining = Math.max(
    Math.ceil((new Date(currentSub.cycleEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  const totalCapacity = (currentSub.priorLinksCount || 0) + allocatedQuota;
  const percentage = Math.min(Math.round((cycleUsedCount / allocatedQuota) * 100), 100);

  return {
    plan: activePlan,
    status: currentSub.status as "active" | "canceled" | "past_due",
    billingCycle: (currentSub.billingCycle as "monthly" | "yearly") || "monthly",
    nextBillingDate: currentSub.cycleEndDate.toISOString().split("T")[0],
    cycleStartDate: currentSub.cycleStartDate.toISOString(),
    cycleEndDate: currentSub.cycleEndDate.toISOString(),
    daysRemaining,
    allocatedQuota,
    priorLinksCount: currentSub.priorLinksCount || 0,
    cycleUsedCount,
    remainingInCycle,
    isCapReached: allocatedQuota >= 10000,
    maxCap: 10000,
    usage: {
      links: allLinks.length,
      limit: totalCapacity,
      percentage,
    },
  };
}

export async function checkCanCreateLink(
  userId?: string,
  userEmail?: string
): Promise<{ allowed: boolean; reason?: string; remaining: number; plan: string }> {
  const sub = await getUserSubscription(userId, userEmail);

  if (sub.plan === "FREE") {
    if (sub.usage.links >= sub.usage.limit) {
      return {
        allowed: false,
        reason: `You have reached your Free tier limit of ${sub.usage.limit} links. Upgrade to Pro to get 1,000+ fresh links/month and advanced visitor analytics!`,
        remaining: 0,
        plan: sub.plan,
      };
    }
    return {
      allowed: true,
      remaining: sub.usage.limit - sub.usage.links,
      plan: sub.plan,
    };
  }

  // PRO or ENTERPRISE
  if (sub.remainingInCycle <= 0) {
    return {
      allowed: false,
      reason: `You have consumed your monthly cycle quota of ${sub.allocatedQuota.toLocaleString()} links. You can top-up additional points (+1,000 links up to 10,000 max) or wait for your cycle renewal in ${sub.daysRemaining ?? 0} days.`,
      remaining: 0,
      plan: sub.plan,
    };
  }

  return {
    allowed: true,
    remaining: sub.remainingInCycle,
    plan: sub.plan,
  };
}

export async function topUpUserQuota(
  userId: string,
  userEmail: string | undefined,
  pointsToAdd = 1000
): Promise<{ success: boolean; newQuota: number; message: string }> {
  const sub = await getUserSubscription(userId, userEmail);
  if (sub.plan === "FREE") {
    throw new Error("You must be on a Pro plan to top-up points. Please upgrade to Pro first.");
  }
  if (sub.allocatedQuota >= 10000) {
    throw new Error("Maximum cap of 10,000 points reached. You cannot add more points at this time.");
  }

  const allowedAddition = Math.min(pointsToAdd, 10000 - sub.allocatedQuota);
  const updatedSub = await updateUserPlan(userId, userEmail, "PRO", {
    isTopUp: true,
    topUpPoints: allowedAddition,
  });

  return {
    success: true,
    newQuota: updatedSub.allocatedQuota,
    message: `Successfully added ${allowedAddition.toLocaleString()} links to your account! Current cycle quota: ${updatedSub.allocatedQuota.toLocaleString()} links.`,
  };
}

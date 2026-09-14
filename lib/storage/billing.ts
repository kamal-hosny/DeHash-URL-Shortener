import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
  plan: "PRO" | "ENTERPRISE" | "FREE";
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

const COUPONS_FILE_PATH = path.join(process.cwd(), "data", "coupons.json");
const INVOICES_FILE_PATH = path.join(process.cwd(), "data", "invoices.json");
const SUBSCRIPTIONS_FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coupon-yearly100",
    code: "YEARLY100",
    discountPercent: 100,
    description: "100% Free Pro Yearly Subscription (2,000 links/mo)",
    applicableCycle: "yearly",
    maxUses: null,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-monthly100",
    code: "MONTHLY100",
    discountPercent: 100,
    description: "100% Free Pro Monthly Subscription (1,000 links/mo)",
    applicableCycle: "monthly",
    maxUses: null,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-free100",
    code: "FREE100",
    discountPercent: 100,
    description: "100% Free Pro Access (All Cycles)",
    applicableCycle: "all",
    maxUses: null,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-dehash100",
    code: "DEHASH100",
    discountPercent: 100,
    description: "DeHash Special 100% Free Upgrade Code",
    applicableCycle: "all",
    maxUses: null,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-save50",
    code: "SAVE50",
    discountPercent: 50,
    description: "50% Discount on Pro Plan",
    applicableCycle: "all",
    maxUses: 500,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-special25",
    code: "SPECIAL25",
    discountPercent: 25,
    description: "25% Welcome Discount on Pro Plan",
    applicableCycle: "all",
    maxUses: 1000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

async function ensureFileExists(filePath: string, defaultContent: unknown) {
  try {
    await fs.access(filePath);
  } catch {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), "utf-8");
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    await ensureFileExists(COUPONS_FILE_PATH, DEFAULT_COUPONS);
    const data = await fs.readFile(COUPONS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data) as Coupon[];
    return parsed;
  } catch (err) {
    console.warn("Error reading coupons file:", err);
    return DEFAULT_COUPONS;
  }
}

export async function saveCoupons(coupons: Coupon[]): Promise<void> {
  await ensureFileExists(COUPONS_FILE_PATH, DEFAULT_COUPONS);
  await fs.writeFile(COUPONS_FILE_PATH, JSON.stringify(coupons, null, 2), "utf-8");
}

export async function createCoupon(data: {
  code: string;
  discountPercent: number;
  applicableCycle?: "all" | "monthly" | "yearly";
  description?: string;
  maxUses?: number | null;
  expiresAt?: string | null;
}): Promise<Coupon> {
  const coupons = await getCoupons();
  const normalizedCode = data.code.trim().toUpperCase();

  const existingIndex = coupons.findIndex((c) => c.code.toUpperCase() === normalizedCode);
  if (existingIndex !== -1) {
    throw new Error(`Coupon with code "${normalizedCode}" already exists`);
  }

  const newCoupon: Coupon = {
    id: crypto.randomUUID(),
    code: normalizedCode,
    discountPercent: Math.min(Math.max(Number(data.discountPercent), 1), 100),
    description: data.description?.trim() || `${data.discountPercent}% Discount`,
    applicableCycle: data.applicableCycle || "all",
    maxUses: data.maxUses ? Number(data.maxUses) : null,
    usedCount: 0,
    expiresAt: data.expiresAt || null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  coupons.unshift(newCoupon);
  await saveCoupons(coupons);
  return newCoupon;
}

export async function deleteCoupon(idOrCode: string): Promise<boolean> {
  const coupons = await getCoupons();
  const filtered = coupons.filter(
    (c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
  );
  if (filtered.length === coupons.length) return false;
  await saveCoupons(filtered);
  return true;
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
  const coupons = await getCoupons();
  const normalized = code.trim().toUpperCase();
  const found = coupons.find((c) => c.code.toUpperCase() === normalized && c.isActive);

  if (!found) {
    return { valid: false, error: "Invalid or inactive discount code" };
  }

  // Check billing cycle compatibility if specified
  if (billingCycle && found.applicableCycle && found.applicableCycle !== "all") {
    if (found.applicableCycle !== billingCycle) {
      const allowedCycleLabel =
        found.applicableCycle === "yearly"
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

  if (found.maxUses && found.usedCount >= found.maxUses) {
    return { valid: false, error: "This coupon code has reached its maximum usage limit" };
  }

  if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
    return { valid: false, error: "This coupon code has expired" };
  }

  return { valid: true, coupon: found };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const coupons = await getCoupons();
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);
  if (coupon) {
    coupon.usedCount += 1;
    await saveCoupons(coupons);
  }
}

// Invoices Storage
export async function getInvoices(): Promise<Invoice[]> {
  try {
    await ensureFileExists(INVOICES_FILE_PATH, []);
    const data = await fs.readFile(INVOICES_FILE_PATH, "utf-8");
    return JSON.parse(data) as Invoice[];
  } catch (err) {
    console.warn("Error reading invoices file:", err);
    return [];
  }
}

export async function saveInvoices(invoices: Invoice[]): Promise<void> {
  await ensureFileExists(INVOICES_FILE_PATH, []);
  await fs.writeFile(INVOICES_FILE_PATH, JSON.stringify(invoices, null, 2), "utf-8");
}

export async function getUserInvoices(userId?: string, userEmail?: string): Promise<Invoice[]> {
  const invoices = await getInvoices();
  if (!userId && !userEmail) return invoices;
  return invoices.filter((inv) => {
    if (userId && inv.userId === userId) return true;
    if (userEmail && inv.userEmail && inv.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    return false;
  });
}

export async function createInvoice(data: {
  userId: string;
  userEmail?: string;
  plan: "PRO" | "ENTERPRISE" | "FREE";
  amount: number;
  originalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status?: "paid" | "pending" | "failed";
}): Promise<Invoice> {
  const invoices = await getInvoices();
  const newInvoice: Invoice = {
    id: `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: data.userId,
    userEmail: data.userEmail,
    plan: data.plan,
    amount: data.amount,
    originalAmount: data.originalAmount,
    discountAmount: data.discountAmount,
    couponCode: data.couponCode || null,
    status: data.status || "paid",
    createdAt: new Date().toISOString(),
  };

  invoices.unshift(newInvoice);
  await saveInvoices(invoices);
  return newInvoice;
}

// User Subscriptions Storage (Fallback & Neon Sync)
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

async function getStoredSubscriptions(): Promise<StoredSubscription[]> {
  try {
    await ensureFileExists(SUBSCRIPTIONS_FILE_PATH, []);
    const data = await fs.readFile(SUBSCRIPTIONS_FILE_PATH, "utf-8");
    return JSON.parse(data) as StoredSubscription[];
  } catch {
    return [];
  }
}

async function saveStoredSubscriptions(subs: StoredSubscription[]): Promise<void> {
  await ensureFileExists(SUBSCRIPTIONS_FILE_PATH, []);
  await fs.writeFile(SUBSCRIPTIONS_FILE_PATH, JSON.stringify(subs, null, 2), "utf-8");
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
  // 1. Update Neon PostgreSQL if configured
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
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
    } catch (err) {
      console.warn("Neon DB updateUserPlan error:", err);
    }
  }

  // 2. Fetch existing user links to guarantee Zero-Penalty Upgrade
  const existingLinks = await getStoredLinks(userId);
  const subs = await getStoredSubscriptions();
  const existingIndex = subs.findIndex(
    (s) => s.userId === userId || (userEmail && s.userEmail?.toLowerCase() === userEmail.toLowerCase())
  );

  const now = new Date();
  const cycleEnd = new Date(now);
  cycleEnd.setDate(cycleEnd.getDate() + 30);

  const billingCycle =
    options?.billingCycle ||
    (existingIndex !== -1 ? subs[existingIndex].billingCycle : "monthly") ||
    "monthly";
  const defaultQuota = billingCycle === "yearly" ? 2000 : 1000;

  let targetSub: StoredSubscription;

  if (plan === "FREE") {
    targetSub = {
      userId,
      userEmail,
      plan: "FREE",
      status: "active",
      billingCycle: "monthly",
      cycleStartDate: now.toISOString(),
      cycleEndDate: cycleEnd.toISOString(),
      allocatedQuota: 50,
      priorLinksCount: 0,
      updatedAt: now.toISOString(),
    };
  } else {
    // PRO or ENTERPRISE
    if (options?.isTopUp && existingIndex !== -1) {
      const currentQuota = subs[existingIndex].allocatedQuota || defaultQuota;
      const pointsToAdd = options.topUpPoints ?? 1000;
      const newQuota = Math.min(currentQuota + pointsToAdd, 10000);

      targetSub = {
        ...subs[existingIndex],
        plan,
        status: "active",
        allocatedQuota: newQuota,
        updatedAt: now.toISOString(),
      };
    } else {
      // New upgrade or re-subscription
      // Zero-penalty: all links created up to this point are stored as priorLinksCount
      // New allocatedQuota is fresh points (1,000 for monthly, 2,000 for yearly), or stacked if already PRO
      let allocatedQuota = defaultQuota;
      if (existingIndex !== -1 && subs[existingIndex].plan === "PRO") {
        // Stacking subscription top-up: add points up to 10,000 ceiling
        allocatedQuota = Math.min(
          (subs[existingIndex].allocatedQuota || 0) + defaultQuota,
          10000
        );
      }

      targetSub = {
        userId,
        userEmail,
        plan,
        status: "active",
        billingCycle,
        cycleStartDate: now.toISOString(),
        cycleEndDate: cycleEnd.toISOString(),
        allocatedQuota,
        priorLinksCount: existingLinks.length, // Free/past links are preserved without reducing quota
        updatedAt: now.toISOString(),
      };
    }
  }

  if (existingIndex !== -1) {
    subs[existingIndex] = targetSub;
  } else {
    subs.push(targetSub);
  }

  await saveStoredSubscriptions(subs);
  return targetSub;
}

export async function getUserSubscription(
  userId?: string,
  userEmail?: string,
  sessionPlan?: "FREE" | "PRO"
): Promise<UserSubscriptionInfo> {
  let activePlan: "FREE" | "PRO" | "ENTERPRISE" = sessionPlan || "FREE";

  // 1. Check Neon PostgreSQL
  if (process.env.DATABASE_URL && (userId || userEmail)) {
    try {
      const db = getDb();
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

  // 2. Fetch local subscriptions record
  const subs = await getStoredSubscriptions();
  const matchedIndex = subs.findIndex(
    (s) =>
      (userId && s.userId === userId) ||
      (userEmail && s.userEmail?.toLowerCase() === userEmail.toLowerCase())
  );

  if (matchedIndex !== -1) {
    if (activePlan === "FREE" && subs[matchedIndex].plan !== "FREE") {
      activePlan = subs[matchedIndex].plan;
    }
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
  let stored = matchedIndex !== -1 ? subs[matchedIndex] : null;

  if (!stored) {
    // Initialize standard subscription record
    const cycleEnd = new Date(now);
    cycleEnd.setDate(cycleEnd.getDate() + 30);
    stored = {
      userId: userId || "user",
      userEmail,
      plan: activePlan,
      status: "active",
      billingCycle: "monthly",
      cycleStartDate: now.toISOString(),
      cycleEndDate: cycleEnd.toISOString(),
      allocatedQuota: 1000,
      priorLinksCount: allLinks.length,
      updatedAt: now.toISOString(),
    };
    subs.push(stored);
    await saveStoredSubscriptions(subs);
  } else {
    // Check 30-day expiration and auto-renewal
    const cycleEndTime = new Date(stored.cycleEndDate).getTime();
    if (now.getTime() >= cycleEndTime) {
      // 30 days elapsed! Auto-renew cycle for active subscriptions
      const nextEnd = new Date(now);
      nextEnd.setDate(nextEnd.getDate() + 30);

      // Links created in the previous cycle are moved to priorLinksCount
      // so they do NOT penalize or eat into the fresh 2,000 / 1,000 points!
      stored.priorLinksCount = allLinks.length;
      stored.cycleStartDate = now.toISOString();
      stored.cycleEndDate = nextEnd.toISOString();
      stored.allocatedQuota = stored.billingCycle === "yearly" ? 2000 : 1000;
      stored.updatedAt = now.toISOString();

      subs[matchedIndex] = stored;
      await saveStoredSubscriptions(subs);
    }
  }

  // Calculate links created ONLY during the current 30-day cycle
  const cycleStartTime = new Date(stored.cycleStartDate).getTime();
  const cycleLinks = allLinks.filter((l) => {
    const linkTime = new Date(l.createdAt).getTime();
    return !isNaN(linkTime) && linkTime >= cycleStartTime;
  });

  const cycleUsedCount = cycleLinks.length;
  const allocatedQuota = Math.min(
    stored.allocatedQuota || (stored.billingCycle === "yearly" ? 2000 : 1000),
    10000
  );
  const remainingInCycle = Math.max(allocatedQuota - cycleUsedCount, 0);

  const daysRemaining = Math.max(
    Math.ceil((new Date(stored.cycleEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  const totalCapacity = (stored.priorLinksCount || 0) + allocatedQuota;
  const percentage = Math.min(Math.round((cycleUsedCount / allocatedQuota) * 100), 100);

  return {
    plan: activePlan,
    status: stored.status,
    billingCycle: stored.billingCycle || "monthly",
    nextBillingDate: stored.cycleEndDate.split("T")[0],
    cycleStartDate: stored.cycleStartDate,
    cycleEndDate: stored.cycleEndDate,
    daysRemaining,
    allocatedQuota,
    priorLinksCount: stored.priorLinksCount || 0,
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
    message: `🎉 Successfully added ${allowedAddition.toLocaleString()} links to your account! Current cycle quota: ${updatedSub.allocatedQuota.toLocaleString()} links.`,
  };
}


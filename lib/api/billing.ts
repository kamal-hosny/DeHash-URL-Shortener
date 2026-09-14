import { Coupon, Invoice, UserSubscriptionInfo } from "@/lib/storage/billing";

export interface BillingResponse {
  success: boolean;
  subscription: UserSubscriptionInfo;
  invoices: Invoice[];
  error?: string;
}

export interface UpgradeResponse {
  success: boolean;
  message: string;
  plan: "PRO" | "ENTERPRISE";
  amount: number;
  discountPercent?: number;
  couponCode?: string | null;
  invoice?: Invoice;
  error?: string;
}

export interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
  error?: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  redeemed: boolean;
  discountPercent: number;
  plan?: string;
  message: string;
  coupon?: Coupon;
  invoice?: Invoice;
  error?: string;
}

export async function fetchBillingInfo(): Promise<BillingResponse> {
  const res = await fetch("/api/billing", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load billing information");
  }
  return res.json();
}

export interface TopUpResponse {
  success: boolean;
  newQuota: number;
  message: string;
  error?: string;
}

export async function upgradeSubscription(
  plan: "PRO" | "ENTERPRISE",
  couponCode?: string,
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<UpgradeResponse> {
  const res = await fetch("/api/billing/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, couponCode, billingCycle }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upgrade subscription");
  }
  return data;
}

export async function topUpQuota(points = 1000): Promise<TopUpResponse> {
  const res = await fetch("/api/billing/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to top up points");
  }
  return data;
}

export async function cancelSubscription(): Promise<{ success: boolean; message: string; plan: string }> {
  const res = await fetch("/api/billing/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to cancel subscription");
  }
  return data;
}

export async function fetchCoupons(): Promise<CouponsResponse> {
  const res = await fetch("/api/billing/coupons", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch coupons");
  }
  return res.json();
}

export async function createNewCoupon(input: {
  code: string;
  discountPercent: number;
  applicableCycle?: "all" | "monthly" | "yearly";
  description?: string;
  maxUses?: number | null;
  expiresAt?: string | null;
}): Promise<{ success: boolean; coupon: Coupon; message: string }> {
  const res = await fetch("/api/billing/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create coupon");
  }
  return data;
}

export async function removeCoupon(code: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/billing/coupons?code=${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete coupon");
  }
  return data;
}

export async function applyOrRedeemCoupon(
  code: string,
  redeemDirectly = false,
  billingCycle?: "monthly" | "yearly"
): Promise<ApplyCouponResponse> {
  const res = await fetch("/api/billing/coupons/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redeemDirectly, billingCycle }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to apply coupon");
  }
  return data;
}


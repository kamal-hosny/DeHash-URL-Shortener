import Stripe from "stripe";

export const isStripeConfigured = (): boolean => {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(
    key &&
      !key.includes("...") &&
      (key.startsWith("sk_test_") || key.startsWith("sk_live_"))
  );
};

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe | null => {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (
    !key ||
    key.includes("...") ||
    (!key.startsWith("sk_test_") && !key.startsWith("sk_live_"))
  ) {
    return null;
  }

  stripeInstance = new Stripe(key, {
    apiVersion: "2025-02-24.acacia" as any,
    appInfo: {
      name: "DeHash URL Shortener",
      version: "1.0.0",
    },
  });

  return stripeInstance;
};

export const STRIPE_PRICES = {
  PRO: {
    monthly: {
      amount: 1200, // in cents ($12.00)
      currency: "usd",
      interval: "month" as const,
      name: "DeHash Pro (Monthly)",
      description: "1,000 links/mo, QR codes, link expiration, and analytics",
    },
    yearly: {
      amount: 10800, // in cents ($108.00 / year = $9/mo)
      currency: "usd",
      interval: "year" as const,
      name: "DeHash Pro (Yearly)",
      description: "2,000 links/mo, QR codes, link expiration, and analytics",
    },
  },
  ENTERPRISE: {
    monthly: {
      amount: 4900,
      currency: "usd",
      interval: "month" as const,
      name: "DeHash Enterprise (Monthly)",
      description: "Unlimited links, team workspaces, custom domains, and SLA",
    },
    yearly: {
      amount: 49000,
      currency: "usd",
      interval: "year" as const,
      name: "DeHash Enterprise (Yearly)",
      description: "Unlimited links, team workspaces, custom domains, and SLA",
    },
  },
  TOPUP: {
    amount: 500, // in cents ($5.00 USD)
    currency: "usd",
    name: "DeHash Link Top-Up (+1,000 Links)",
    description: "One-time add-on of 1,000 short link points for your active cycle",
    points: 1000,
    priceFormatted: "$5.00",
  },
};

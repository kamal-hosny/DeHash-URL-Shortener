# Phase 6: Future Enhancements & Scaling Guide

## Overview
This phase outlines advanced features, performance optimizations, and scaling strategies for the URL shortener application after initial production deployment.

---

## Step 1: Payment Integration

### 1.1 Stripe Setup

Create `lib/stripe/client.ts`:
```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const PRICING = {
  PRO_MONTHLY: {
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    amount: 500, // $5.00
    currency: "usd",
    interval: "month",
    links: 1000,
  },
  PRO_YEARLY: {
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    amount: 5000, // $50.00
    currency: "usd",
    interval: "year",
    links: 1000,
  },
};
```

### 1.2 Subscription API Routes

Create `app/api/billing/create-checkout-session/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { priceId, interval } = await request.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

### 1.3 Webhook Handler

Create `app/api/billing/webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId && subscription.status === "active") {
          await db
            .update(users)
            .set({ subscriptionPlan: "PRO" })
            .where(eq(users.id, parseInt(userId)));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db
            .update(users)
            .set({ subscriptionPlan: "FREE" })
            .where(eq(users.id, parseInt(userId)));
        }
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("Payment succeeded:", event.data.object);
        break;
      }

      case "invoice.payment_failed": {
        console.log("Payment failed:", event.data.object);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Step 2: Advanced Analytics

### 2.1 Time-Series Analytics

Create `lib/services/analytics-advanced.ts`:
```typescript
import { db } from "@/lib/db/client";
import { linkAnalytics } from "@/lib/db/schema";
import { eq, gte, lte } from "drizzle-orm";

export async function getAnalyticsTrend(
  linkId: number,
  startDate: Date,
  endDate: Date,
  interval: "hour" | "day" | "week" | "month" = "day"
) {
  const analytics = await db.query.linkAnalytics.findMany({
    where: and(
      eq(linkAnalytics.linkId, linkId),
      gte(linkAnalytics.clickedAt, startDate),
      lte(linkAnalytics.clickedAt, endDate)
    ),
  });

  const trend: Record<string, number> = {};

  analytics.forEach((a) => {
    let key: string;
    const date = new Date(a.clickedAt);

    switch (interval) {
      case "hour":
        key = date.toISOString().slice(0, 13) + ":00:00";
        break;
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const week = Math.floor(
          (date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
        key = `${date.getFullYear()}-W${week}`;
        break;
      case "month":
        key = date.toISOString().slice(0, 7);
        break;
    }

    trend[key] = (trend[key] || 0) + 1;
  });

  return trend;
}

export async function getTopReferrers(linkId: number, limit: number = 10) {
  const analytics = await db.query.linkAnalytics.findMany({
    where: eq(linkAnalytics.linkId, linkId),
  });

  const referrers: Record<string, number> = {};

  analytics.forEach((a) => {
    if (a.referrer) {
      try {
        const url = new URL(a.referrer);
        const domain = url.hostname;
        referrers[domain] = (referrers[domain] || 0) + 1;
      } catch {
        referrers["direct"] = (referrers["direct"] || 0) + 1;
      }
    } else {
      referrers["direct"] = (referrers["direct"] || 0) + 1;
    }
  });

  return Object.entries(referrers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getGeoAnalytics(linkId: number) {
  const analytics = await db.query.linkAnalytics.findMany({
    where: eq(linkAnalytics.linkId, linkId),
  });

  const geoData: Record<string, Record<string, number>> = {};

  analytics.forEach((a) => {
    const country = a.country || "Unknown";
    const city = a.city || "Unknown";

    if (!geoData[country]) {
      geoData[country] = {};
    }

    geoData[country][city] = (geoData[country][city] || 0) + 1;
  });

  return geoData;
}
```

### 2.2 Advanced Analytics API

Create `app/api/links/[id]/analytics-advanced/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, shortLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getAnalyticsTrend,
  getTopReferrers,
  getGeoAnalytics,
} from "@/lib/services/analytics-advanced";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const link = await db.query.shortLinks.findFirst({
      where: and(
        eq(shortLinks.id, parseInt(params.id)),
        eq(shortLinks.userId, user.id)
      ),
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate")
      ? new Date(url.searchParams.get("startDate")!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = url.searchParams.get("endDate")
      ? new Date(url.searchParams.get("endDate")!)
      : new Date();
    const interval = (url.searchParams.get("interval") ||
      "day") as "hour" | "day" | "week" | "month";

    const [trend, topReferrers, geoData] = await Promise.all([
      getAnalyticsTrend(link.id, startDate, endDate, interval),
      getTopReferrers(link.id),
      getGeoAnalytics(link.id),
    ]);

    return NextResponse.json({
      trend,
      topReferrers,
      geoData,
    });
  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Step 3: API Rate Limiting (Per Endpoint)

### 3.1 Advanced Rate Limiter

Create `lib/redis/advanced-rate-limiter.ts`:
```typescript
import { redis } from "./client";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
  },
  createLink: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
  apiCall: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
};

export async function checkRateLimit(
  userId: number,
  endpoint: string,
  config?: RateLimitConfig
) {
  const limit = config || DEFAULT_LIMITS[endpoint] || DEFAULT_LIMITS.apiCall;
  const key = `ratelimit:${endpoint}:${userId}`;

  const current = await redis.get<number>(key);
  const count = (current || 0) + 1;

  if (count > limit.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: await redis.ttl(key),
    };
  }

  if (current === null) {
    await redis.setex(key, Math.ceil(limit.windowMs / 1000), count);
  } else {
    await redis.incr(key);
  }

  return {
    allowed: true,
    remaining: limit.maxRequests - count,
    resetIn: await redis.ttl(key),
  };
}
```

---

## Step 4: Caching Strategy

### 4.1 Cache Layer

Create `lib/cache/cache-manager.ts`:
```typescript
import { redis } from "@/lib/redis/client";

const CACHE_DURATIONS = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 24 * 60 * 60, // 24 hours
};

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get<string>(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async set<T>(
    key: string,
    value: T,
    duration: number = CACHE_DURATIONS.MEDIUM
  ): Promise<void> {
    await redis.setex(key, duration, JSON.stringify(value));
  }

  static async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  static async invalidate(pattern: string): Promise<void> {
    // Simple pattern matching (more complex patterns need custom implementation)
    const key = `${pattern}*`;
    // Implement key pattern deletion
  }

  // Link cache
  static getLinkCacheKey(linkId: number): string {
    return `link:${linkId}`;
  }

  static getAnalyticsCacheKey(linkId: number, period: string): string {
    return `analytics:${linkId}:${period}`;
  }

  static getUserCacheKey(userId: number): string {
    return `user:${userId}`;
  }
}
```

### 4.2 Cache Middleware

Create `lib/middleware/cache-middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { CacheManager } from "@/lib/cache/cache-manager";

export async function withCache(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  cacheKey: string,
  duration: number = 5 * 60
) {
  // Only cache GET requests
  if (request.method !== "GET") {
    return handler();
  }

  // Try to get from cache
  const cached = await CacheManager.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Call handler and cache result
  const response = await handler();

  if (response.status === 200) {
    const data = await response.clone().json();
    await CacheManager.set(cacheKey, data, duration);
  }

  return response;
}
```

---

## Step 5: Email Notifications

### 5.1 Email Service Setup

Create `lib/email/mailer.ts`:
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@linkshort.com",
      ...options,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to LinkShort!",
    html: `
      <h1>Welcome to LinkShort!</h1>
      <p>Your account has been successfully created.</p>
      <p>Start shortening your links today!</p>
    `,
  });
}

export async function sendUpgradeConfirmation(email: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to LinkShort Pro!",
    html: `
      <h1>Upgrade Successful!</h1>
      <p>You now have access to Pro features:</p>
      <ul>
        <li>1000 links per month</li>
        <li>Advanced analytics</li>
        <li>Priority support</li>
      </ul>
    `,
  });
}
```

---

## Step 6: Custom Domains

### 6.1 Custom Domain Schema Extension

Add to `lib/db/schema.ts`:
```typescript
export const customDomains = pgTable(
  "custom_domains",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    verified: boolean("verified").default(false),
    verificationToken: varchar("verification_token", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDomainIdx: uniqueIndex("user_domain_idx").on(table.userId, table.domain),
  })
);

export const customDomainsRelations = relations(customDomains, ({ one }) => ({
  user: one(users, { fields: [customDomains.userId], references: [users.id] }),
}));
```

### 6.2 Custom Domain Service

Create `lib/services/domain-service.ts`:
```typescript
import { db } from "@/lib/db/client";
import { customDomains } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function addCustomDomain(userId: number, domain: string) {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const result = await db
    .insert(customDomains)
    .values({
      userId,
      domain,
      verificationToken,
    })
    .returning();

  return result[0];
}

export async function verifyCustomDomain(
  userId: number,
  domain: string,
  token: string
) {
  const domainRecord = await db.query.customDomains.findFirst({
    where: and(
      eq(customDomains.userId, userId),
      eq(customDomains.domain, domain),
      eq(customDomains.verificationToken, token)
    ),
  });

  if (!domainRecord) {
    return { success: false, error: "Invalid verification token" };
  }

  await db
    .update(customDomains)
    .set({ verified: true, verificationToken: null })
    .where(eq(customDomains.id, domainRecord.id));

  return { success: true };
}

export async function getUserCustomDomains(userId: number) {
  return await db.query.customDomains.findMany({
    where: eq(customDomains.userId, userId),
  });
}
```

---

## Step 7: Bulk Operations

### 7.1 Bulk Import/Export

Create `app/api/links/bulk/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, shortLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userLinks = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, user.id),
    });

    // Convert to CSV
    const csv = [
      "Short Code,Original URL,Created At,Expires At",
      ...userLinks.map(
        (link) =>
          `${link.shortCode},${link.originalUrl},${link.createdAt.toISOString()},${link.expiresAt?.toISOString() || ""}`
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=links.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").slice(1); // Skip header

    // Validate and insert links
    const errors: string[] = [];
    let successCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const [, originalUrl] = line.split(",");

      if (!originalUrl || !originalUrl.startsWith("http")) {
        errors.push(`Invalid URL: ${originalUrl}`);
        continue;
      }

      try {
        // Create link (validation will be done by service)
        // await createShortLink({ ... })
        successCount++;
      } catch (err) {
        errors.push(`Failed to create link for ${originalUrl}`);
      }
    }

    return NextResponse.json({
      successCount,
      errors,
    });
  } catch (error) {
    console.error("Error importing links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Step 8: Performance Optimization

### 8.1 Database Query Optimization

```typescript
// Use connection pooling
// Implement database indexes for frequently queried columns
// Add query result caching
// Use pagination for large datasets

// Example optimized query:
export async function getOptimizedUserLinks(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  return await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    limit,
    offset,
    orderBy: (table) => table.createdAt,
    // Use indexes on userId and createdAt
  });
}
```

### 8.2 Image Optimization

Update `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
};
```

---

## Step 9: Multi-Language Support

### 9.1 i18n Setup

Create `lib/i18n/config.ts`:
```typescript
export const SUPPORTED_LANGUAGES = ["en", "ar", "es", "fr", "de"];
export const DEFAULT_LANGUAGE = "en";

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
```

Create `lib/i18n/translations.ts`:
```typescript
const translations = {
  en: {
    common: {
      appName: "LinkShort",
      createLink: "Create Link",
      analytics: "Analytics",
    },
  },
  ar: {
    common: {
      appName: "اختصار الرابط",
      createLink: "إنشاء رابط",
      analytics: "التحليلات",
    },
  },
};

export function t(key: string, lang: string = "en"): string {
  const keys = key.split(".");
  let value: any = translations[lang as keyof typeof translations] || translations.en;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
```

---

## Step 10: Advanced Security

### 10.1 Two-Factor Authentication

Create `lib/auth/2fa.ts`:
```typescript
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateQRCode(secret: string, email: string) {
  const otpauth_url = speakeasy.otpauthURL({
    secret: secret,
    label: `LinkShort (${email})`,
    issuer: "LinkShort",
    encoding: "base32",
  });

  return QRCode.toDataURL(otpauth_url);
}

export function generateSecret() {
  return speakeasy.generateSecret({
    name: "LinkShort",
  });
}

export function verifyToken(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2,
  });
}
```

### 10.2 Content Security Policy

Update `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};
```

---

## Step 11: Infrastructure Scaling

### 11.1 Database Replication

```sql
-- PostgreSQL Replication Setup
CREATE PUBLICATION primary_pub FOR ALL TABLES;
CREATE SUBSCRIPTION replica_sub CONNECTION 'postgresql://...' PUBLICATION primary_pub;
```

### 11.2 Redis Clustering

```docker
# Docker Compose for Redis Cluster
version: '3.8'
services:
  redis-1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
    ports:
      - "6379:6379"
  redis-2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
    ports:
      - "6380:6379"
  redis-3:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
    ports:
      - "6381:6379"
```

### 11.3 Load Balancing

```nginx
upstream backend {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Step 12: Roadmap Summary

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| **Payment Integration** | High | Large | 2-3 weeks |
| **Advanced Analytics** | High | Medium | 1-2 weeks |
| **Custom Domains** | Medium | Large | 2-3 weeks |
| **2FA Security** | Medium | Medium | 1-2 weeks |
| **Multi-Language** | Low | Medium | 1-2 weeks |
| **Bulk Operations** | Medium | Small | 1 week |
| **Email Notifications** | Medium | Small | 1 week |
| **Database Optimization** | High | Medium | 1-2 weeks |
| **Load Balancing** | High | Large | 2-3 weeks |
| **Redis Clustering** | Medium | Large | 2-3 weeks |

---

## Implementation Order Recommendation

1. **Week 1-2**: Payment Integration + Advanced Analytics
2. **Week 3**: Email Notifications + Bulk Operations
3. **Week 4-5**: Custom Domains + 2FA
4. **Week 6-7**: Database Optimization + Performance Tuning
5. **Week 8+**: Scaling Infrastructure + Multi-Language Support

---

## Monitoring & Metrics to Track

### Key Performance Indicators (KPIs)
- **User Engagement**: Active users, links created per user
- **Performance**: Page load time, API response time
- **Reliability**: Uptime percentage, error rate
- **Business**: Conversion rate, churn rate, revenue

### Implementation Tools
- **Monitoring**: Datadog, New Relic, Prometheus
- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Mixpanel, Amplitude
- **Logging**: ELK Stack, Splunk

---

## Security Checklist for Phase 6

- [ ] SSL/TLS certificates renewed
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed
- [ ] OWASP Top 10 compliance verified
- [ ] DDoS protection configured
- [ ] Regular backups automated
- [ ] Disaster recovery plan tested
- [ ] Privacy policy updated
- [ ] GDPR/CCPA compliance verified
- [ ] Security headers configured

---

## Budget Estimation for Phase 6

| Service | Monthly Cost | Use Case |
|---------|--------------|----------|
| Stripe | 2.9% + $0.30 per transaction | Payment processing |
| Datadog | $15-30 | Monitoring |
| SendGrid | $10-25 | Email service |
| AWS Backup | $10-50 | Data backup |
| Security Tools | $20-50 | Security scanning |
| **Total** | **$70-180** | Infrastructure |

---

**Status**: Phase 6 - Planning & Future Roadmap Complete

### Success Metrics After Phase 6:
- ✅ Payment processing fully operational
- ✅ Advanced analytics driving user insights
- ✅ Custom domains supporting enterprise use
- ✅ Infrastructure scaled to handle 10x user growth
- ✅ Security posture significantly improved
- ✅ User experience enhanced with new features

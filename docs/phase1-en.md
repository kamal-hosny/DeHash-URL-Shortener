# Phase 1: Infrastructure Setup - Complete Implementation Guide

## Overview
This phase covers setting up the complete infrastructure for the URL Shortener project, including database, Redis, authentication, and project structure.

---

## Step 1: Project Initialization

### 1.1 Create Next.js Project
```bash
npx create-next-app@latest "URL shortener project" --typescript --tailwind --app
cd "URL shortener project"
```

### 1.2 Install Dependencies
```bash
npm install dotenv
npm install drizzle-orm drizzle-kit
npm install postgres pg
npm install next-auth@4
npm install bcryptjs
npm install @upstash/redis
npm install zod
npm install axios
npm install @tanstack/react-query
npm install zustand
npm install qrcode.react
npm install -D typescript @types/node @types/react
```

### 1.3 Project Structure Setup

Complete folder structure:

```
project-root/
├── app/                          # Next.js App Router - all pages and APIs
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── (auth)/                  # Layout group for authentication pages
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   └── page.tsx         # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx         # Password reset page
│   │   └── layout.tsx           # Auth layout
│   ├── (public)/                # Public pages layout group
│   │   ├── pricing/
│   │   │   └── page.tsx         # Pricing page
│   │   ├── about/
│   │   │   └── page.tsx         # About page
│   │   ├── features/
│   │   │   └── page.tsx         # Features page
│   │   └── layout.tsx           # Public layout
│   ├── (protected)/             # Private/protected routes (require authentication)
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── my-links/
│   │   │   │   └── page.tsx     # Links management
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx     # Analytics page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx     # Settings page
│   │   │   └── domains/
│   │   │       └── page.tsx     # Custom domains page
│   │   ├── admin/               # Admin-only routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx     # User management
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx     # Analytics dashboard
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx     # Audit logs
│   │   │   └── settings/
│   │   │       └── page.tsx     # Admin settings
│   │   └── layout.tsx           # Protected layout with sidebar
│   ├── api/                     # RESTful API routes
│   │   ├── auth/
│   │   │   ├── signin/route.ts
│   │   │   ├── signup/route.ts
│   │   │   ├── signout/route.ts
│   │   │   └── session/route.ts
│   │   ├── links/
│   │   │   ├── route.ts         # GET all links, POST new link
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts     # GET, PUT, DELETE specific link
│   │   │   │   ├── stats/
│   │   │   │   │   └── route.ts # Link analytics
│   │   │   │   └── qr/
│   │   │   │       └── route.ts # Generate QR code
│   │   │   └── validate/
│   │   │       └── route.ts     # Validate URL
│   │   ├── analytics/
│   │   │   ├── route.ts         # GET user analytics
│   │   │   └── export/
│   │   │       └── route.ts     # Export analytics as CSV
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   └── route.ts     # User management
│   │   │   ├── analytics/
│   │   │   │   └── route.ts     # System analytics
│   │   │   └── audit-logs/
│   │   │       └── route.ts     # Audit logs
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts
│   │   └── health/
│   │       └── route.ts         # Health check endpoint
│   ├── r/[code]/                # Redirect handler for short links
│   │   └── route.ts             # Handles redirect logic
│   ├── expired/                 # Expired links page
│   │   └── page.tsx
│   ├── not-found.tsx            # 404 error page
│   ├── error.tsx                # Error boundary
│   └── loading.tsx              # Loading skeleton
│
├── components/                  # React components (Reusable)
│   ├── atoms/                   # Smallest components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Icon.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Select.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── molecules/               # Composite components
│   │   ├── LinkForm.tsx         # Form for creating short links
│   │   ├── LinkCard.tsx         # Display short link info
│   │   ├── LinkList.tsx         # List of user's links
│   │   ├── AnalyticsChart.tsx   # Chart component
│   │   ├── QRCodeGenerator.tsx  # QR code display
│   │   ├── PaginationControls.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterDropdown.tsx
│   │   ├── CopyButton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── NotificationAlert.tsx
│   │   └── index.ts
│   └── organisms/               # Complex page sections
│       ├── Navbar.tsx           # Header navigation
│       ├── Sidebar.tsx          # Side navigation
│       ├── DashboardLayout.tsx  # Dashboard wrapper
│       ├── AdminLayout.tsx      # Admin panel wrapper
│       ├── LinksDashboard.tsx   # Links management section
│       ├── AnalyticsDashboard.tsx # Analytics section
│       ├── UserSettingsPanel.tsx # User settings form
│       ├── AdminUsersPanel.tsx  # Manage users (admin)
│       ├── AdminAnalyticsPanel.tsx # System-wide analytics
│       ├── PricingTable.tsx     # Pricing page table
│       ├── FeaturesList.tsx     # Features showcase
│       ├── FaqAccordion.tsx     # FAQ section
│       └── index.ts
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useLinks.ts             # Short links hook
│   ├── useAnalytics.ts         # Analytics hook
│   ├── usePagination.ts        # Pagination logic
│   ├── useFetch.ts             # Data fetching hook
│   ├── useDebounce.ts          # Debounce hook
│   ├── useLocalStorage.ts      # Local storage hook
│   ├── useClickOutside.ts      # Click outside detection
│   ├── useInfiniteScroll.ts    # Infinite scroll logic
│   ├── useTheme.ts             # Theme switching
│   └── index.ts
│
├── lib/                         # Business logic and utilities
│   ├── db/                      # Database operations
│   │   ├── index.ts            # DB connection & initialization
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   ├── migrations/
│   │   │   ├── 001_init.sql
│   │   │   ├── 002_add_analytics.sql
│   │   │   └── 003_add_indexes.sql
│   │   └── seeds/
│   │       └── seed.ts         # Initial data seeding
│   ├── auth/                    # Authentication
│   │   ├── config.ts           # NextAuth configuration
│   │   ├── providers.ts        # Auth providers (Google, GitHub)
│   │   ├── middleware.ts       # Auth middleware
│   │   ├── permissions.ts      # Role-based access control
│   │   └── jwt.ts              # JWT utilities
│   ├── redis/                   # Caching & rate limiting
│   │   ├── client.ts           # Redis connection
│   │   ├── rate-limiter.ts     # Rate limiting logic
│   │   ├── cache.ts            # Caching utilities
│   │   └── session.ts          # Session management
│   ├── validators/              # Input validation schemas
│   │   ├── link.ts             # Link validation (Zod)
│   │   ├── user.ts             # User validation
│   │   ├── auth.ts             # Auth validation
│   │   └── analytics.ts        # Analytics validation
│   ├── services/                # Business logic services
│   │   ├── link.service.ts     # Link CRUD operations
│   │   ├── analytics.service.ts # Analytics aggregation
│   │   ├── user.service.ts     # User management
│   │   ├── domain.service.ts   # Custom domains
│   │   ├── export.service.ts   # Data export
│   │   ├── email.service.ts    # Email sending
│   │   └── stripe.service.ts   # Payment processing
│   ├── utils.ts                 # General utilities
│   │   └── Helper functions (encoding, validation, etc.)
│   └── constants.ts             # App-wide constants
│
├── store/                       # Zustand state management
│   ├── authStore.ts            # User auth state
│   ├── linkStore.ts            # Links state
│   ├── uiStore.ts              # UI state (modals, toasts)
│   ├── analyticsStore.ts       # Analytics filters state
│   └── index.ts
│
├── types/                       # TypeScript definitions
│   ├── user.ts                 # User types
│   ├── link.ts                 # Link types
│   ├── analytics.ts            # Analytics types
│   ├── api.ts                  # API response types
│   ├── database.ts             # Database types
│   ├── auth.ts                 # Auth types
│   └── index.ts                # Barrel export
│
├── contexts/                    # React contexts (alternative to Zustand)
│   ├── AuthContext.tsx         # Authentication context
│   ├── ThemeContext.tsx        # Theme context
│   └── NotificationContext.tsx # Notifications context
│
├── providers/                   # Provider wrappers
│   ├── AuthProvider.tsx        # Auth session provider
│   ├── ThemeProvider.tsx       # Theme provider
│   ├── QueryProvider.tsx       # React Query provider
│   └── index.ts
│
├── config/                      # Configuration files
│   ├── env.ts                  # Environment variables
│   ├── constants.ts            # App constants
│   ├── features.ts             # Feature flags
│   └── api.ts                  # API configuration
│
├── locales/                     # i18n translations
│   ├── en.json                 # English translations
│   ├── ar.json                 # Arabic translations
│   └── fr.json                 # French translations (future)
│
├── utils/                       # Utility functions
│   ├── api-client.ts           # API request helper
│   ├── date.ts                 # Date utilities
│   ├── string.ts               # String utilities
│   ├── formatter.ts            # Formatting utilities
│   └── logger.ts               # Logging utility
│
├── public/                      # Static assets
│   ├── logo.svg
│   ├── favicon.ico
│   ├── images/
│   │   ├── hero.png
│   │   ├── features.png
│   │   └── screenshot.png
│   └── fonts/
│       └── custom-font.woff2
│
├── docs/                        # Documentation
│   ├── phase1.md
│   ├── phase2.md
│   ├── API.md                  # API documentation
│   └── SETUP.md                # Setup guide
│
├── .env.local                   # Environment variables (local)
├── .env.example                 # Example environment file
├── .gitignore
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── postcss.config.mjs          # PostCSS configuration
├── package.json                # Dependencies & scripts
├── package-lock.json
└── README.md                    # Project documentation
```

#### 1.3.1 Key Directories Explained

**`app/` Directory - Next.js App Router**
- Purpose: Contains all pages, layouts, and API routes
- Pattern: Uses layout groups `(auth)`, `(public)`, `(protected)` for organization
- API Structure: RESTful routes organized by feature (auth, links, admin, webhooks)
- Special Routes: 
  - `r/[code]/route.ts`: Handles short link redirects
  - `api/health/route.ts`: Health check endpoint
  - Error pages: `error.tsx`, `not-found.tsx`, `loading.tsx`

**`components/` Directory - React Components**
- Pattern: Atomic Design (atoms → molecules → organisms)
  - **Atoms**: Basic UI elements (Button, Input, Card, Badge)
  - **Molecules**: Composite components (LinkForm, LinkCard, AnalyticsChart)
  - **Organisms**: Complex sections (Navbar, Sidebar, DashboardLayout)
- Benefit: Reusable, testable, scalable component architecture
- Organization: Each component in its own folder with index.ts export

**`lib/` Directory - Business Logic**
- `db/`: Database connection, schema, migrations
- `auth/`: NextAuth setup, JWT, permissions, middleware
- `redis/`: Rate limiting, caching, session storage
- `validators/`: Zod schemas for input validation
- `services/`: Business logic for links, analytics, users
- `utils.ts`: General-purpose utility functions
- `constants.ts`: App-wide constants and config

**`hooks/` Directory - Custom React Hooks**
- `useAuth`: Access current user and auth methods
- `useLinks`: Fetch and manage short links
- `useAnalytics`: Analytics data and filtering
- `usePagination`: Handle pagination state
- `useFetch`: Generic data fetching with loading/error states

**`store/` Directory - Zustand State Management**
- `authStore`: User authentication state
- `linkStore`: Links data and filters
- `uiStore`: Modal visibility, toast notifications
- `analyticsStore`: Date ranges, filters
- Benefit: Lightweight, type-safe state management

**`types/` Directory - TypeScript Definitions**
- Centralized type definitions for entire app
- Files organized by domain: user, link, analytics, api, database
- Benefit: Single source of truth for types, prevents duplication

**`config/` Directory - Configuration**
- Environment variables validation
- Feature flags for A/B testing
- API endpoints configuration
- App-wide constants

**`locales/` Directory - Internationalization**
- JSON translation files for each language (en, ar, fr)
- Used with i18n library for multi-language support
- File structure: `{ "key": "translation" }`

#### 1.3.2 File Placement Logic

| Directory | File Type | Purpose | Example |
|-----------|-----------|---------|---------|
| `app/` | `.tsx` / `.ts` | Pages and API routes | `app/dashboard/page.tsx` |
| `components/` | `.tsx` | React components | `components/atoms/Button.tsx` |
| `lib/` | `.ts` | Business logic | `lib/services/link.service.ts` |
| `hooks/` | `.ts` | Custom hooks | `hooks/useAuth.ts` |
| `store/` | `.ts` | State stores | `store/authStore.ts` |
| `types/` | `.ts` | Type definitions | `types/user.ts` |
| `utils/` | `.ts` | Utilities | `utils/date.ts` |
| `config/` | `.ts` | Configuration | `config/env.ts` |

#### 1.3.3 Implementation Example: Creating a New Feature

When creating a new feature (e.g., custom domains):

```typescript
// 1. Define types in types/domain.ts
export type Domain = {
  id: string;
  userId: string;
  domain: string;
  isVerified: boolean;
  createdAt: Date;
};

// 2. Create database schema in lib/db/schema.ts
export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  domain: varchar('domain').unique(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Create service in lib/services/domain.service.ts
export class DomainService {
  async createDomain(userId: string, domain: string) { }
  async verifyDomain(domainId: string) { }
  async deleteDomain(domainId: string) { }
}

// 4. Create validation in lib/validators/domain.ts
export const createDomainSchema = z.object({
  domain: z.string().url(),
});

// 5. Create API route in app/api/domains/route.ts
export async function POST(req: Request) {
  // Validate input, call service, return response
}

// 6. Create components
// - components/atoms/DomainCard.tsx
// - components/molecules/DomainForm.tsx
// - components/organisms/DomainsPanel.tsx

// 7. Create hooks in hooks/useDomains.ts
export function useDomains() { }

// 8. Create page in app/(protected)/dashboard/domains/page.tsx
export default function DomainsPage() {
  const domains = useDomains();
  return <DomainsPanel />;
}
```

#### 1.3.4 Folder Organization Rules

1. **Flat for small items**: Atoms, types, validators are files, not folders
2. **Hierarchical for complex**: Services, components have own folders
3. **Feature-based API routes**: Organize by feature (links, admin, auth), not by HTTP method
4. **Co-locate related files**: Component + its styles + tests together
5. **No circular dependencies**: Services depend on types, types are pure
6. **Barrel exports (index.ts)**: Use for public API of each folder
7. **Environment config separate**: Never hardcode config in business logic

#### 1.3.5 Summary

- Structure follows Next.js App Router conventions
- Atomic Design pattern ensures reusable components
- Service layer separates concerns and enables testing
- Type definitions co-located with implementation
- Configuration files centralized for maintainability
- Clear placement rules prevent architectural drift
- Feature-based organization scales as project grows

---

## Step 2: Database Setup (Neon PostgreSQL)

### 2.1 Create Neon Account & Database
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Create a new database (default: `neondb`)
4. Copy the connection string

### 2.2 Drizzle ORM Configuration

Create `drizzle.config.ts`:
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  driver: "postgres",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 2.3 Database Connection Setup

Create `lib/db/client.ts`:
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### 2.4 Database Schema

Create `lib/db/schema.ts`:
```typescript
import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  uniqueIndex,
  index,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("FREE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastActivity: timestamp("last_activity").defaultNow(),
    isAdmin: boolean("is_admin").default(false),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

// Subscription Plans Table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  linksPerMonth: integer("links_per_month").notNull(),
  price: integer("price").notNull(),
});

// Short Links Table
export const shortLinks = pgTable(
  "short_links",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    originalUrl: text("original_url").notNull(),
    originalUrlHash: varchar("original_url_hash", { length: 64 }).notNull(),
    shortCode: varchar("short_code", { length: 10 }).unique().notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    shortCodeIdx: uniqueIndex("short_code_idx").on(table.shortCode),
    userUrlHashIdx: uniqueIndex("user_url_hash_idx").on(table.userId, table.originalUrlHash),
  })
);

// Link Analytics Table
export const linkAnalytics = pgTable(
  "link_analytics",
  {
    id: serial("id").primaryKey(),
    linkId: integer("link_id").notNull(),
    clickedAt: timestamp("clicked_at").defaultNow().notNull(),
    referrer: text("referrer"),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    deviceType: varchar("device_type", { length: 50 }),
    browser: varchar("browser", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
  },
  (table) => ({
    linkIdIdx: index("link_id_idx").on(table.linkId),
    clickedAtIdx: index("clicked_at_idx").on(table.clickedAt),
  })
);

// Audit Logs Table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    action: varchar("action", { length: 50 }).notNull(),
    details: json("details"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => ({
    userIdIdx: index("audit_user_id_idx").on(table.userId),
    timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
  })
);

// User Monthly Usage Table
export const userMonthlyUsage = pgTable(
  "user_monthly_usage",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
    linksCreated: integer("links_created").default(0).notNull(),
    apiRequests: integer("api_requests").default(0).notNull(),
  },
  (table) => ({
    userMonthIdx: uniqueIndex("user_month_idx").on(table.userId, table.month),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shortLinks: many(shortLinks),
  auditLogs: many(auditLogs),
  monthlyUsage: many(userMonthlyUsage),
}));

export const shortLinksRelations = relations(shortLinks, ({ one, many }) => ({
  user: one(users, { fields: [shortLinks.userId], references: [users.id] }),
  analytics: many(linkAnalytics),
}));

export const linkAnalyticsRelations = relations(linkAnalytics, ({ one }) => ({
  link: one(shortLinks, { fields: [linkAnalytics.linkId], references: [shortLinks.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const userMonthlyUsageRelations = relations(userMonthlyUsage, ({ one }) => ({
  user: one(users, { fields: [userMonthlyUsage.userId], references: [users.id] }),
}));
```

### 2.5 Generate Migrations & Push Schema
```bash
npx drizzle-kit generate:postgres
npx drizzle-kit push:postgres
```

---

## Step 3: Redis Setup (Upstash)

### 3.1 Create Upstash Account & Database
1. Go to [https://upstash.com](https://upstash.com)
2. Sign up and create a new Redis database
3. Copy the connection URL (redis://default:password@...)

### 3.2 Redis Client Configuration

Create `lib/redis/client.ts`:
```typescript
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});
```

### 3.3 Rate Limiting Module

Create `lib/redis/rate-limiter.ts`:
```typescript
import { redis } from "./client";

const PLAN_LIMITS = {
  FREE: 50,
  PRO: 1000,
};

export async function checkQuota(userId: number, plan: "FREE" | "PRO") {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const current = await redis.get<number>(monthKey);
  const limit = PLAN_LIMITS[plan];

  if ((current || 0) >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  return {
    allowed: true,
    remaining: limit - (current || 0) - 1,
    limit,
  };
}

export async function incrementQuota(userId: number) {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  await redis.incr(monthKey);
  
  // Set expiration to end of month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const secondsUntilEndOfMonth = Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);
  
  await redis.expire(monthKey, secondsUntilEndOfMonth);
}

export async function getQuotaUsage(userId: number) {
  const now = new Date();
  const monthKey = `quota:${userId}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (await redis.get<number>(monthKey)) || 0;
}
```

---

## Step 4: NextAuth Configuration

### 4.1 Setup NextAuth

Create `lib/auth/authOptions.ts`:
```typescript
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.email,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 4.2 NextAuth Route Handler

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## Step 5: Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname

# Redis (Upstash)
REDIS_URL=redis://default:password@xxx.upstash.io:port
REDIS_TOKEN=your-redis-token

# NextAuth
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Optional: Future email service
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

## Step 6: Middleware Setup

Create `middleware.ts`:
```typescript
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export const middleware = withAuth(
  function onSuccess(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedRoutes = ["/dashboard", "/admin"];
        const isProtected = protectedRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        );

        if (isProtected) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/links/:path*"],
};
```

---

## Step 7: TypeScript Types

Create `types/index.ts`:
```typescript
export type UserRole = "USER" | "ADMIN";
export type SubscriptionPlan = "FREE" | "PRO";
export type DeviceType = "Mobile" | "Desktop" | "Tablet";

export interface User {
  id: number;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  isAdmin: boolean;
  createdAt: Date;
  lastActivity: Date | null;
}

export interface ShortLink {
  id: number;
  userId: number;
  originalUrl: string;
  shortCode: string;
  expiresAt: Date | null;
  createdAt: Date;
  isActive: boolean;
}

export interface LinkAnalytic {
  id: number;
  linkId: number;
  clickedAt: Date;
  referrer: string | null;
  country: string | null;
  city: string | null;
  deviceType: DeviceType | null;
  browser: string | null;
  ipAddress: string | null;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  details: Record<string, any> | null;
  timestamp: Date;
  ipAddress: string | null;
}
```

---

## Step 8: Utility Functions

Create `lib/utils.ts`:
```typescript
import crypto from "crypto";

export function generateShortCode(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Block localhost
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
      return false;
    }
    
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
```

---

## Step 9: Validation Schemas

Create `lib/validators/url.ts`:
```typescript
import { z } from "zod";

export const createLinkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  expiresIn: z.enum(["permanent", "1day", "7days", "30days"]).optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

---

## Step 10: Verification Checklist

- [ ] Neon database created and connection string obtained
- [ ] Upstash Redis database created and connection URL obtained
- [ ] `.env.local` file created with all required variables
- [ ] `NEXTAUTH_SECRET` generated using `openssl rand -base64 32`
- [ ] Drizzle migrations generated and pushed
- [ ] All dependencies installed
- [ ] Project structure created
- [ ] NextAuth configured and routes set up
- [ ] Middleware configured for protected routes
- [ ] All utility functions and validators created
- [ ] TypeScript types defined

---

## Step 11: Testing Infrastructure

Run the following commands to verify setup:

```bash
# Test database connection
npx drizzle-kit push:postgres

# Verify TypeScript compilation
npm run type-check

# Start development server
npm run dev
```

Visit `http://localhost:3000` to verify the project runs without errors.

---

## Notes

- Store all secrets in `.env.local` - **never commit to version control**
- Generate a unique `NEXTAUTH_SECRET` for each environment
- Upstash Redis connection strings typically look like: `redis://default:password@host:port`
- Neon connection strings should be: `postgresql://user:password@host/dbname`
- All migrations are automatically handled by Drizzle Kit

---

**Status**: Ready for Phase 2 - Core Features Implementation

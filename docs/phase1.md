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
📁 URL-shortener-project/
│
├── 📁 app/                          # Main application (Next.js App Router)
│   ├── 📁 (auth)/                   # Layout Group for auth pages (no guard)
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── register/
│   │   │   └── page.tsx            # Registration page
│   │   └── layout.tsx              # Auth layout
│   │
│   ├── 📁 (public)/                 # Public pages (no login required)
│   │   ├── page.tsx                # Home page
│   │   ├── pricing/
│   │   │   └── page.tsx            # Pricing page
│   │   ├── about/
│   │   │   └── page.tsx            # About page
│   │   ├── contact/
│   │   │   └── page.tsx            # Contact page
│   │   └── layout.tsx              # Public layout with navigation
│   │
│   ├── 📁 (protected)/              # Protected pages (require authentication)
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── link/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # Link details and analytics
│   │   │   │   └── layout.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx        # User settings
│   │   │   ├── billing/
│   │   │   │   └── page.tsx        # Billing page
│   │   │   └── layout.tsx          # Dashboard layout
│   │   │
│   │   ├── admin/                  # Admin pages (Admin only)
│   │   │   ├── users/
│   │   │   │   ├── page.tsx        # Users list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx   # User details
│   │   │   │   └── layout.tsx
│   │   │   ├── logs/
│   │   │   │   └── page.tsx        # Activity logs
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx        # System analytics
│   │   │   └── layout.tsx
│   │   │
│   │   └── layout.tsx              # Protected layout with sidebar
│   │
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts        # Register new user
│   │   │   ├── login/
│   │   │   │   └── route.ts        # Login
│   │   │   ├── logout/
│   │   │   │   └── route.ts        # Logout
│   │   │   ├── change-password/
│   │   │   │   └── route.ts        # Change password
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth handler
│   │   │
│   │   ├── 📁 links/
│   │   │   ├── route.ts            # POST: Create link, GET: List links
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts        # GET: Details, DELETE: Remove
│   │   │   │   ├── stats/
│   │   │   │   │   └── route.ts   # Link statistics
│   │   │   │   └── analytics-advanced/
│   │   │   │       └── route.ts   # Advanced analytics
│   │   │   ├── bulk/
│   │   │   │   └── route.ts        # Import/Export links
│   │   │   └── validate/
│   │   │       └── route.ts        # Validate URL
│   │   │
│   │   ├── 📁 analytics/
│   │   │   ├── summary/
│   │   │   │   └── route.ts        # Analytics summary
│   │   │   └── trends/
│   │   │       └── route.ts        # Trends
│   │   │
│   │   ├── 📁 admin/
│   │   │   ├── users/
│   │   │   │   ├── route.ts        # Users list
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # User details
│   │   │   └── logs/
│   │   │       └── route.ts        # Audit logs
│   │   │
│   │   ├── 📁 billing/
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts        # Create payment session
│   │   │   └── webhook/
│   │   │       └── route.ts        # Stripe webhook handler
│   │   │
│   │   ├── 📁 health/
│   │   │   └── route.ts            # Health check
│   │   │
│   │   └── 📁 redirect/
│   │       └── route.ts            # Short link redirect handler
│   │
│   ├── 📁 r/                        # Redirect route for short links
│   │   └── [code]/
│   │       └── route.ts            # Redirect handler (e.g.: /r/abc123)
│   │
│   ├── 📁 expired/                  # Expired links page
│   │   └── page.tsx                # Expired link message
│   │
│   ├── layout.tsx                  # Main app layout
│   ├── page.tsx                    # Home page (root)
│   ├── globals.css                 # Global styles
│   └── favicon.ico                 # App icon
│
├── 📁 lib/                          # Helper libraries and utilities
│   ├── 📁 db/                       # Database
│   │   ├── schema.ts               # Table definitions (Drizzle Schema)
│   │   ├── client.ts               # Database connection
│   │   └── migrations/             # Migration files
│   │
│   ├── 📁 auth/                     # Authentication and authorization
│   │   ├── authOptions.ts          # NextAuth configuration
│   │   ├── 2fa.ts                  # Two-factor authentication
│   │   └── permissions.ts          # Permission checks
│   │
│   ├── 📁 redis/                    # Redis and caching
│   │   ├── client.ts               # Redis client
│   │   ├── rate-limiter.ts         # Rate limiting
│   │   ├── advanced-rate-limiter.ts # Advanced rate limiting
│   │   └── cache.ts                # Cache management
│   │
│   ├── 📁 db/                       # Database services
│   │   ├── user-service.ts         # User operations
│   │   ├── link-service.ts         # Link operations
│   │   ├── analytics-service.ts    # Analytics services
│   │   └── analytics-advanced.ts   # Advanced analytics
│   │
│   ├── 📁 validators/              # Data validation
│   │   ├── url.ts                  # URL validation
│   │   ├── form-validator.ts       # Form validation
│   │   └── schemas.ts              # Zod schemas
│   │
│   ├── 📁 api/                      # API utilities
│   │   └── error-handler.ts        # Error handler
│   │
│   ├── 📁 stripe/                   # Payment processing
│   │   └── client.ts               # Stripe client
│   │
│   ├── 📁 email/                    # Email service
│   │   └── mailer.ts               # Email sending
│   │
│   ├── 📁 cache/                    # Caching management
│   │   └── cache-manager.ts        # Cache manager
│   │
│   ├── 📁 i18n/                     # Multi-language support
│   │   ├── config.ts               # Language settings
│   │   └── translations.ts         # Translated text
│   │
│   ├── 📁 logger/                   # Event logging
│   │   └── logger.ts               # Logging tool
│   │
│   ├── 📁 services/                 # General services
│   │   ├── domain-service.ts       # Custom domains service
│   │   ├── link-service.ts         # Links service
│   │   └── analytics-advanced.ts   # Analytics services
│   │
│   └── utils.ts                    # General utility functions
│
├── 📁 components/                   # React Components (Reusable)
│   ├── 📁 atoms/                    # Tiny components
│   │   ├── Button.tsx              # Button
│   │   ├── Input.tsx               # Input field
│   │   ├── Card.tsx                # Card
│   │   ├── Badge.tsx               # Badge
│   │   └── ErrorBoundary.tsx       # Error boundary
│   │
│   ├── 📁 molecules/                # Medium components
│   │   ├── LinkForm.tsx            # Link creation form
│   │   ├── LinkList.tsx            # Links list
│   │   ├── AnalyticsChart.tsx      # Analytics chart
│   │   ├── QRCodeGenerator.tsx     # QR code generator
│   │   └── UserProfile.tsx         # User profile
│   │
│   ├── 📁 organisms/                # Large components (page sections)
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── Sidebar.tsx             # Sidebar
│   │   ├── Footer.tsx              # Footer
│   │   └── Dashboard.tsx           # Full dashboard
│   │
│   └── 📁 templates/                # Page templates
│       ├── AuthLayout.tsx          # Login template
│       ├── DashboardLayout.tsx     # Dashboard template
│       └── AdminLayout.tsx         # Admin pages template
│
├── 📁 hooks/                        # Custom React Hooks
│   ├── useAuth.ts                  # Access user information
│   ├── useLinks.ts                 # Manage links
│   ├── useAnalytics.ts             # Fetch analytics
│   ├── usePagination.ts            # Pagination management
│   ├── useLocalStorage.ts          # Local storage
│   └── useFetch.ts                 # Fetch data
│
├── 📁 store/                        # State management (Zustand/Redux)
│   ├── authStore.ts                # Authentication state
│   ├── linkStore.ts                # Links state
│   ├── uiStore.ts                  # UI state
│   └── index.ts                    # Store exports
│
├── 📁 contexts/                     # Context API for state
│   ├── AuthContext.tsx             # Authentication context
│   ├── ThemeContext.tsx            # Theme context
│   └── NotificationContext.tsx     # Notifications context
│
├── 📁 types/                        # TypeScript definitions
│   ├── index.ts                    # General types
│   ├── user.ts                     # User types
│   ├── link.ts                     # Link types
│   ├── analytics.ts                # Analytics types
│   ├── api.ts                      # API types
│   └── database.ts                 # Database types
│
├── 📁 public/                       # Static files
│   ├── 📁 images/
│   │   ├── logo.svg
│   │   ├── hero.png
│   │   └── features/
│   ├── 📁 icons/
│   │   └── favicon.ico
│   └── 📁 fonts/
│       └── custom-fonts/
│
├── 📁 styles/                       # CSS styles
│   ├── globals.css                 # Global styles
│   ├── variables.css               # CSS variables
│   └── utilities.css               # Utility classes
│
├── 📁 providers/                    # Context providers and libraries
│   ├── AuthProvider.tsx            # Authentication provider
│   ├── QueryProvider.tsx           # React Query provider
│   ├── ThemeProvider.tsx           # Theme provider
│   └── SessionProvider.tsx         # Session provider
│
├── 📁 middleware/                   # Request middleware
│   ├── auth.ts                     # Auth check
│   ├── logging.ts                  # Request logging
│   ├── errorHandler.ts             # Error handler
│   ├── rateLimit.ts                # Rate limiting
│   └── performance.ts              # Performance monitoring
│
├── 📁 __tests__/                    # Unit tests
│   ├── lib/
│   │   ├── utils.test.ts
│   │   └── validators.test.ts
│   ├── components/
│   │   └── LinkForm.test.tsx
│   └── api/
│       └── links.test.ts
│
├── 📁 docs/                         # Project documentation
│   ├── phase1.md
│   ├── phase2.md
│   ├── phase3.md
│   ├── phase4.md
│   ├── phase5.md
│   ├── phase6.md
│   ├── API.md                      # API documentation
│   ├── ARCHITECTURE.md             # Architecture guide
│   └── DEPLOYMENT.md               # Deployment guide
│
├── 📁 drizzle/                      # Migration files (generated)
│   └── [migration files]
│
├── 📁 .next/                        # Build output (ignored)
├── 📁 node_modules/                 # Libraries (ignored)
├── 📁 .env.local                    # Local env variables (ignored)
│
├── 📄 .env.example                  # Example env variables
├── 📄 .gitignore                    # Git ignored files
├── 📄 .eslintrc.json                # ESLint rules
├── 📄 .prettierrc                   # Prettier formatting
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 next.config.ts                # Next.js configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 postcss.config.mjs            # PostCSS configuration
├── 📄 jest.config.js                # Jest configuration
├── 📄 jest.setup.js                 # Jest setup
├── 📄 drizzle.config.ts             # Drizzle ORM configuration
├── 📄 package.json                  # Dependencies management
├── 📄 package-lock.json             # Dependency lock file
├── 📄 vercel.json                   # Vercel deployment settings
├── 📄 docker-compose.yml            # Docker compose setup
├── 📄 Dockerfile                    # Docker image
├── 📄 .dockerignore                 # Docker ignored files
├── 📄 README.md                     # Project readme
└── 📄 LICENSE                       # Project license
```

---

## Detailed Explanation of Each Directory:

### 📁 `app/` - Main Application
**Purpose:** Next.js App Router page structure
- **`(auth)/`**: Login and registration pages (no guard)
- **`(public)/`**: Public pages (home, pricing, about)
- **`(protected)/`**: Protected pages requiring authentication
- **`api/`**: Server API routes
- **`r/`**: Redirect route handler (e.g.: `yourdomain.com/r/abc123`)

### 📁 `lib/` - Helper Libraries
**Purpose:** All utilities and services
- **`db/`**: All database operations
- **`auth/`**: Authentication and authorization
- **`redis/`**: Caching and rate limiting
- **`validators/`**: Data validation

### 📁 `components/` - React Components
**Purpose:** Reusable UI components
- **`atoms/`**: Tiny components (buttons, inputs)
- **`molecules/`**: Medium components (forms, tables)
- **`organisms/`**: Large components (layouts, sidebars)

### 📁 `hooks/` - Custom React Hooks
**Purpose:** Reusable logic patterns
```typescript
// Example:
export function useLinks() {
  const [links, setLinks] = useState([]);
  // Link fetching and management logic
  return { links, addLink, deleteLink };
}
```

### 📁 `store/` - State Management
**Purpose:** Global state storage (Zustand/Redux)
```typescript
// Example:
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### 📁 `types/` - TypeScript Definitions
**Purpose:** Data types and interfaces
```typescript
// Example:
export interface User {
  id: number;
  email: string;
  subscriptionPlan: "FREE" | "PRO";
}
```

### 📁 `public/` - Static Files
**Purpose:** Images, icons, fonts
- Not processed by webpack
- Directly available at `/image.png`

### 📁 `__tests__/` - Tests
**Purpose:** Unit and integration tests
```bash
npm test  # Run tests
```

### 📁 `docs/` - Documentation
**Purpose:** Project and API documentation

---

## Summary of Organization Rules:

| Directory | File Types | Purpose |
|-----------|-----------|---------|
| `app/` | `.tsx`, `.ts` | Pages and APIs |
| `lib/` | `.ts` | Tools and services |
| `components/` | `.tsx` | User interface |
| `hooks/` | `.ts` | Shared logic |
| `store/` | `.ts` | Global state |
| `types/` | `.ts` | TypeScript definitions |
| `public/` | Images, icons | Static files |
| `styles/` | `.css` | Stylesheets |
| `__tests__/` | `.test.ts` | Tests |

---

**Benefit:** This structure makes maintenance, development, and adding new features much easier!

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

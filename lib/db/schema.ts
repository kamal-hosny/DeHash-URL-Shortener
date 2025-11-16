import { 
  pgTable, 
  text, 
  varchar, 
  boolean, 
  timestamp, 
  integer, 
  uniqueIndex, 
  index, 
  json, 
  uuid, 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
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
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  linksPerMonth: integer("links_per_month").notNull(),
  price: integer("price").notNull(),
});

// Short Links Table
export const shortLinks = pgTable(
  "short_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),                     
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
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id").notNull(),                     
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
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"),                                
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
    id: uuid("id").defaultRandom().primaryKey(),            
    userId: uuid("user_id").notNull(),                    
    month: varchar("month", { length: 7 }).notNull(),       
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

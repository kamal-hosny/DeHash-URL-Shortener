export type UserRole = "USER" | "ADMIN";
export type SubscriptionPlan = "FREE" | "PRO";
export type DeviceType = "Mobile" | "Desktop" | "Tablet";

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  isAdmin: boolean;
  createdAt: Date;
  lastActivity: Date | null;
  role?: UserRole;
}

export interface ShortLink {
  id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  expiresAt: Date | null;
  createdAt: Date;
  isActive: boolean;
}

export interface LinkAnalytic {
  id: string;
  linkId: string;
  clickedAt: Date;
  referrer: string | null;
  country: string | null;
  city: string | null;
  deviceType: DeviceType | null;
  browser: string | null;
  ipAddress: string | null;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  details: Record<string, unknown> | null;
  timestamp: Date;
  ipAddress: string | null;
}
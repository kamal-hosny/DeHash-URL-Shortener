# Phase 4: Analytics & Admin Dashboard Implementation Guide

## Overview
This phase covers implementing comprehensive analytics dashboards for users and admin management features for system administrators.

---

## Step 1: Analytics Service API Routes

### 1.1 User Analytics Summary Route

Create `app/api/analytics/summary/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserAnalyticsSummary } from "@/lib/services/analytics-service";

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

    const summary = await getUserAnalyticsSummary(user.id);

    return NextResponse.json(summary.data);
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 1.2 Link Click Statistics Route

Create `app/api/links/[id]/stats/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, shortLinks, linkAnalytics } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

    const analytics = await db.query.linkAnalytics.findMany({
      where: eq(linkAnalytics.linkId, link.id),
    });

    // Calculate statistics
    const totalClicks = analytics.length;
    const uniqueIps = new Set(analytics.map((a) => a.ipAddress)).size;
    const lastClick = analytics.length > 0 
      ? new Date(Math.max(...analytics.map((a) => a.clickedAt.getTime())))
      : null;

    const deviceStats = analytics.reduce(
      (acc, a) => {
        const device = a.deviceType || "Unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const browserStats = analytics.reduce(
      (acc, a) => {
        const browser = a.browser || "Unknown";
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const countryStats = analytics.reduce(
      (acc, a) => {
        if (a.country) {
          acc[a.country] = (acc[a.country] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const clicksPerDay: Record<string, number> = {};
    analytics.forEach((a) => {
      const date = a.clickedAt.toISOString().split("T")[0];
      clicksPerDay[date] = (clicksPerDay[date] || 0) + 1;
    });

    return NextResponse.json({
      link: {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
      },
      stats: {
        totalClicks,
        uniqueVisitors: uniqueIps,
        lastClick,
        deviceStats,
        browserStats,
        countryStats,
        clicksPerDay,
      },
    });
  } catch (error) {
    console.error("Error fetching link stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Step 2: Admin API Routes

### 2.1 Admin Users List Route

Create `app/api/admin/users/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, shortLinks, userMonthlyUsage } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function checkAdminAccess(email: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user?.isAdmin || false;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const allUsers = await db.query.users.findMany({
      limit,
      offset,
    });

    // Get link counts and usage for each user
    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const linkCount = await db.query.shortLinks.findMany({
          where: eq(shortLinks.userId, user.id),
        });

        const monthUsage = await db.query.userMonthlyUsage.findFirst({
          where: eq(userMonthlyUsage.userId, user.id),
        });

        return {
          id: user.id,
          email: user.email,
          subscriptionPlan: user.subscriptionPlan,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity,
          totalLinks: linkCount.length,
          monthlyUsage: monthUsage?.linksCreated || 0,
        };
      })
    );

    return NextResponse.json({
      users: userStats,
      total: userStats.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2.2 Admin User Details Route

Create `app/api/admin/users/[id]/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, shortLinks, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function checkAdminAccess(email: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user?.isAdmin || false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = parseInt(params.id);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userLinks = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, userId),
    });

    const userAuditLogs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.userId, userId),
      limit: 50,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastActivity: user.lastActivity,
      },
      stats: {
        totalLinks: userLinks.length,
        activeLinks: userLinks.filter((l) => l.isActive).length,
      },
      recentActivity: userAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
      })),
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2.3 Admin Audit Logs Route

Create `app/api/admin/logs/route.ts`:
```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { db } from "@/lib/db/client";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function checkAdminAccess(email: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user?.isAdmin || false;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const action = url.searchParams.get("action");

    let query = db.query.auditLogs.findMany({
      limit,
      offset,
    });

    const logs = await db.query.auditLogs.findMany({
      limit,
      offset,
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
      })),
      total: logs.length,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Step 3: Analytics Components

### 3.1 Analytics Chart Component

Create `components/molecules/AnalyticsChart.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  linkId: number;
}

export default function AnalyticsChart({ linkId }: AnalyticsChartProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [linkId]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/links/${linkId}/stats`);
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Total Clicks</div>
          <div className="text-3xl font-bold">{stats.stats.totalClicks}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Unique Visitors</div>
          <div className="text-3xl font-bold">
            {stats.stats.uniqueVisitors}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Last Click</div>
          <div className="text-sm font-semibold">
            {stats.stats.lastClick
              ? new Date(stats.stats.lastClick).toLocaleDateString()
              : "No clicks yet"}
          </div>
        </div>
      </div>

      {/* Device Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Devices</h3>
        <div className="space-y-3">
          {Object.entries(stats.stats.deviceStats).map(([device, count]: [string, any]) => (
            <div key={device}>
              <div className="flex justify-between text-sm mb-1">
                <span>{device}</span>
                <span className="font-semibold">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (count / stats.stats.totalClicks) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Browsers</h3>
        <div className="space-y-3">
          {Object.entries(stats.stats.browserStats)
            .slice(0, 5)
            .map(([browser, count]: [string, any]) => (
              <div key={browser}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{browser}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (count / stats.stats.totalClicks) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Geographic Stats */}
      {Object.keys(stats.stats.countryStats).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Top Countries</h3>
          <div className="space-y-3">
            {Object.entries(stats.stats.countryStats)
              .sort(([, a]: any, [, b]: any) => b - a)
              .slice(0, 5)
              .map(([country, count]: [string, any]) => (
                <div key={country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{country}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (count / stats.stats.totalClicks) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Link Analytics Page

### 4.1 Analytics Page

Create `app/(protected)/dashboard/link/[id]/page.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import AnalyticsChart from "@/components/molecules/AnalyticsChart";
import Link from "next/link";

export default function LinkAnalyticsPage() {
  const params = useParams();
  const linkId = params.id as string;
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLink();
  }, [linkId]);

  const fetchLink = async () => {
    try {
      const response = await axios.get(`/api/links/${linkId}`);
      setLink(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load link");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-2">Link Analytics</h1>
          <p className="text-gray-600">Short Code: {link?.shortCode}</p>
        </div>
      </header>

      {/* Link Info */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Original URL</div>
              <a
                href={link?.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {link?.originalUrl}
              </a>
            </div>
            <div>
              <div className="text-sm text-gray-600">Short Link</div>
              <code className="text-sm bg-gray-100 p-2 rounded">
                {window.location.origin}/r/{link?.shortCode}
              </code>
            </div>
          </div>
          {link?.expiresAt && (
            <div className="mt-4">
              <div className="text-sm text-gray-600">Expires</div>
              <span>{new Date(link.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Analytics */}
        <AnalyticsChart linkId={parseInt(linkId)} />
      </main>
    </div>
  );
}
```

---

## Step 5: Admin Dashboard

### 5.1 Admin Users List Page

Create `app/(protected)/admin/users/page.tsx`:
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface AdminUser {
  id: number;
  email: string;
  subscriptionPlan: string;
  isAdmin: boolean;
  createdAt: Date;
  lastActivity: Date | null;
  totalLinks: number;
  monthlyUsage: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data.users);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to load users. Check admin status."
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Total Links
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  This Month
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.subscriptionPlan === "PRO"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.totalLinks}</td>
                  <td className="px-6 py-4 text-sm">{user.monthlyUsage}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No users found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

### 5.2 Admin User Details Page

Create `app/(protected)/admin/users/[id]/page.tsx`:
```typescript
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`);
      setUserDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/users"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold">{userDetails?.user?.email}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Subscription Plan</div>
            <div className="text-2xl font-bold">
              {userDetails?.user?.subscriptionPlan}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Links</div>
            <div className="text-2xl font-bold">{userDetails?.stats?.totalLinks}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Active Links</div>
            <div className="text-2xl font-bold">{userDetails?.stats?.activeLinks}</div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-bold mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Created</div>
              <div>{new Date(userDetails?.user?.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Last Activity</div>
              <div>
                {userDetails?.user?.lastActivity
                  ? new Date(userDetails.user.lastActivity).toLocaleDateString()
                  : "Never"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Admin</div>
              <div>{userDetails?.user?.isAdmin ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Timestamp</th>
                  <th className="text-left py-2">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {userDetails?.recentActivity?.map((activity: any) => (
                  <tr key={activity.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{activity.action}</td>
                    <td className="py-2">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 font-mono text-xs">{activity.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!userDetails?.recentActivity || userDetails.recentActivity.length === 0) && (
              <div className="text-center py-8 text-gray-600">
                No activity recorded
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 5.3 Admin Audit Logs Page

Create `app/(protected)/admin/logs/page.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  details: Record<string, any> | null;
  timestamp: Date;
  ipAddress: string | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/admin/logs");
      setLogs(response.data.logs);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Audit Logs</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">User ID</th>
                <th className="px-6 py-3 text-left font-semibold">Action</th>
                <th className="px-6 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-6 py-3 text-left font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{log.userId || "System"}</td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No audit logs found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

---

## Step 6: Verification Checklist

- [ ] Analytics summary API working
- [ ] Link statistics API returning correct data
- [ ] Admin users list API functional
- [ ] Admin user details API working
- [ ] Audit logs API accessible
- [ ] Analytics chart displaying device/browser stats
- [ ] Analytics page showing link details
- [ ] Admin users list page accessible
- [ ] Admin user details page displaying activity
- [ ] Admin audit logs page showing all actions
- [ ] Permission checks preventing non-admin access
- [ ] All charts rendering correctly

---

## Step 7: Protected Routes Configuration

Update `middleware.ts` to include admin routes:
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
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/links/:path*",
    "/api/admin/:path*",
    "/api/analytics/:path*",
  ],
};
```

---

## Key Features Implemented

✅ **User Analytics**: Comprehensive click tracking and statistics  
✅ **Device Detection**: Tracks mobile, desktop, tablet usage  
✅ **Browser Stats**: Identifies visitor browsers  
✅ **Geographic Data**: Country-based analytics  
✅ **Admin Dashboard**: Complete user management  
✅ **Audit Logs**: Full action history with timestamps  
✅ **Admin Users List**: View all users with statistics  
✅ **User Activity**: Track individual user actions  
✅ **Permission Checks**: Admin-only access control  
✅ **Detailed Charts**: Visual analytics representation  

---

**Status**: Phase 4 Complete - Ready for Phase 5 (Polish & Deployment)

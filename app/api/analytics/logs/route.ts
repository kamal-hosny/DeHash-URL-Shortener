import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getStoredLinks, getLinkAnalyticsData, isValidUUID } from "@/lib/storage/links";
import { getDb } from "@/lib/db/client";
import { shortLinks, linkAnalytics } from "@/lib/db/schema";
import { desc, inArray, eq } from "drizzle-orm";
import { ClickItem } from "@/lib/api/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const links = await getStoredLinks(userId);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 500);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const shortCodeFilter = searchParams.get("shortCode")?.trim().toLowerCase();
    const searchQuery = searchParams.get("search")?.trim().toLowerCase();

    // Map links for fast lookup
    const linkMap = new Map<string, (typeof links)[0]>();
    const codeMap = new Map<string, (typeof links)[0]>();
    links.forEach((l) => {
      linkMap.set(l.id, l);
      codeMap.set(l.shortCode.toLowerCase(), l);
    });

    const activeLinks = shortCodeFilter
      ? links.filter((l) => l.shortCode.toLowerCase() === shortCodeFilter)
      : links;

    let allLogs: ClickItem[] = [];

    // Strategy 1: Attempt direct DB query with Neon PostgreSQL
    let dbSuccess = false;
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        const validLinkIds = activeLinks
          .map((l) => l.id)
          .filter((id) => isValidUUID(id));

        if (validLinkIds.length > 0) {
          const rows = await db
            .select({
              id: linkAnalytics.id,
              linkId: linkAnalytics.linkId,
              clickedAt: linkAnalytics.clickedAt,
              referrer: linkAnalytics.referrer,
              country: linkAnalytics.country,
              city: linkAnalytics.city,
              deviceType: linkAnalytics.deviceType,
              browser: linkAnalytics.browser,
              ipAddress: linkAnalytics.ipAddress,
              shortCode: shortLinks.shortCode,
              originalUrl: shortLinks.originalUrl,
            })
            .from(linkAnalytics)
            .innerJoin(shortLinks, eq(linkAnalytics.linkId, shortLinks.id))
            .where(inArray(linkAnalytics.linkId, validLinkIds))
            .orderBy(desc(linkAnalytics.clickedAt))
            .limit(1000);

          allLogs = rows.map((r) => {
            const matchedLink = linkMap.get(r.linkId) || codeMap.get(r.shortCode.toLowerCase());
            return {
              id: r.id,
              clickedAt: r.clickedAt.toISOString(),
              country: r.country,
              city: r.city,
              referrer: r.referrer,
              deviceType: r.deviceType,
              browser: r.browser,
              ipAddress: r.ipAddress,
              shortCode: r.shortCode,
              linkName: matchedLink?.name,
              originalUrl: r.originalUrl,
            };
          });

          dbSuccess = true;
        }
      } catch (dbErr) {
        console.warn("Neon DB visitor logs query fallback:", dbErr);
      }
    }

    // Strategy 2: Fallback to aggregate analytics per link if DB was skipped or returned empty
    if (!dbSuccess || allLogs.length === 0) {
      const analyticsList = await Promise.all(
        activeLinks.map(async (l) => {
          const a = await getLinkAnalyticsData(l.shortCode);
          return { link: l, analytics: a };
        })
      );

      const combined: ClickItem[] = [];
      analyticsList.forEach(({ link, analytics }) => {
        if (analytics?.recentClicks) {
          analytics.recentClicks.forEach((rc) => {
            combined.push({
              ...rc,
              shortCode: link.shortCode,
              linkName: link.name,
              originalUrl: link.originalUrl,
            });
          });
        }
      });

      combined.sort(
        (a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
      );

      allLogs = combined;
    }

    // Search query filter
    if (searchQuery) {
      allLogs = allLogs.filter((log) => {
        return (
          (log.shortCode && log.shortCode.toLowerCase().includes(searchQuery)) ||
          (log.linkName && log.linkName.toLowerCase().includes(searchQuery)) ||
          (log.originalUrl && log.originalUrl.toLowerCase().includes(searchQuery)) ||
          (log.country && log.country.toLowerCase().includes(searchQuery)) ||
          (log.city && log.city.toLowerCase().includes(searchQuery)) ||
          (log.referrer && log.referrer.toLowerCase().includes(searchQuery)) ||
          (log.deviceType && log.deviceType.toLowerCase().includes(searchQuery)) ||
          (log.browser && log.browser.toLowerCase().includes(searchQuery)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(searchQuery))
        );
      });
    }

    const total = allLogs.length;
    const paginatedLogs = allLogs.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      total,
      links: links.map((l) => ({
        id: l.id,
        shortCode: l.shortCode,
        name: l.name,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/analytics/logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor logs" },
      { status: 500 }
    );
  }
}

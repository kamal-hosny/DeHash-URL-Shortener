import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getStoredLinks, getLinkAnalyticsData } from "@/lib/storage/links";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const links = await getStoredLinks(userId);

    let totalClicks = 0;
    let totalUniqueVisitors = 0;
    const countryMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const referrerMap: Record<string, number> = {};
    const allRecentClicks: Array<{
      id: string;
      clickedAt: string;
      country?: string | null;
      city?: string | null;
      referrer?: string | null;
      deviceType?: string | null;
      browser?: string | null;
      ipAddress?: string | null;
      shortCode?: string;
      linkName?: string;
    }> = [];

    const analyticsList = await Promise.all(
      links.map(async (l) => {
        const a = await getLinkAnalyticsData(l.shortCode);
        return { link: l, analytics: a };
      })
    );

    const topLinksList: Array<{
      id: string;
      name?: string;
      shortCode: string;
      originalUrl: string;
      clicks: number;
      topCountry?: string;
      topReferrer?: string;
      isActive: boolean;
    }> = [];

    analyticsList.forEach(({ link, analytics }) => {
      const linkClicks = Math.max(link.clicks || 0, analytics?.totalClicks || 0);
      totalClicks += linkClicks;
      totalUniqueVisitors += analytics?.uniqueVisitors || (linkClicks > 0 ? 1 : 0);

      const topCountry = analytics?.locationData?.[0]?.label;
      const topReferrer = analytics?.referrerData?.[0]?.label;

      topLinksList.push({
        id: link.id,
        name: link.name,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: linkClicks,
        topCountry,
        topReferrer,
        isActive: link.isActive,
      });

      if (!analytics) return;

      analytics.locationData?.forEach((loc) => {
        if (loc.label && loc.label !== "Unknown") {
          countryMap[loc.label] = (countryMap[loc.label] || 0) + loc.value;
        }
      });
      analytics.deviceData?.forEach((dev) => {
        deviceMap[dev.label] = (deviceMap[dev.label] || 0) + dev.value;
      });
      analytics.browserData?.forEach((b) => {
        browserMap[b.label] = (browserMap[b.label] || 0) + b.value;
      });
      analytics.referrerData?.forEach((ref) => {
        referrerMap[ref.label] = (referrerMap[ref.label] || 0) + ref.value;
      });

      if (analytics.recentClicks) {
        analytics.recentClicks.forEach((rc) => {
          allRecentClicks.push({
            ...rc,
            shortCode: link.shortCode,
            linkName: link.name,
          });
        });
      }
    });

    // Sort top links by clicks descending
    topLinksList.sort((a, b) => b.clicks - a.clicks);

    // Sort recent clicks by timestamp descending
    allRecentClicks.sort(
      (a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
    );

    const locationData = Object.entries(countryMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const deviceData = Object.entries(deviceMap)
      .map(([label, value]) => ({
        label,
        value,
        color:
          label === "Desktop"
            ? "#3b82f6"
            : label === "Mobile"
            ? "#8b5cf6"
            : "#10b981",
      }))
      .sort((a, b) => b.value - a.value);

    const browserColors: Record<string, string> = {
      Chrome: "#f59e0b",
      Safari: "#06b6d4",
      Firefox: "#ec4899",
      Edge: "#6366f1",
      Opera: "#ef4444",
    };

    const browserData = Object.entries(browserMap)
      .map(([label, value]) => ({
        label,
        value,
        color: browserColors[label] || "#a855f7",
      }))
      .sort((a, b) => b.value - a.value);

    const referrerData = Object.entries(referrerMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const topSource = referrerData[0]?.label || "Direct";
    const topCountry = locationData[0]?.label || "N/A";

    return NextResponse.json({
      success: true,
      totalLinks: links.length,
      activeLinks: links.filter((l) => l.isActive).length,
      totalClicks,
      uniqueVisitors: totalUniqueVisitors,
      topSource,
      topCountry,
      locationData,
      deviceData,
      browserData,
      referrerData,
      topLinks: topLinksList.slice(0, 5),
      recentClicks: allRecentClicks.slice(0, 20),
    });
  } catch (error) {
    console.error("Error in aggregate analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

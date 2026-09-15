"use client";

import React, { useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLinkStore } from "@/store/linkStore";
import { useLinkAnalyticsQuery } from "@/hooks/queries/useAnalyticsQuery";
import {
  MousePointer2,
  Users,
  Globe,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Copy,
  Activity,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/molecules/dashboard/StatCard";
import AnalyticsChart from "@/components/ui/AnalyticsChart";
import LinkQrCard from "@/components/molecules/dashboard/LinkQrCard";
import { useToast } from "@/hooks/useToast";
import Link from "@/components/ui/Link";

export default function LinkAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { links, updateLink } = useLinkStore();
  const { toast } = useToast();
  const linkId = params.id as string;

  const { data: queryData, isLoading } = useLinkAnalyticsQuery(linkId);

  const link = useMemo(
    () => links.find((l) => l.id === linkId || l.shortCode === linkId) || queryData?.link,
    [links, linkId, queryData?.link]
  );

  const analytics = queryData?.analytics || null;

  // Keep local store clicks synchronized with real-time analytics
  useEffect(() => {
    if (queryData?.link && queryData?.analytics) {
      updateLink(queryData.link.id, {
        clicks: queryData.analytics.totalClicks ?? queryData.link.clicks,
      });
    }
  }, [queryData, updateLink]);

  if (!link && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Link not found</h2>
        <p className="text-muted-foreground">
          The link you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/dashboard/links")}>
          Go back to Links
        </Button>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullShortUrl = `${origin}/r/${link.shortCode}`;

  const currentClicks = analytics?.totalClicks ?? link.clicks;
  const currentUniqueVisitors =
    analytics?.uniqueVisitors ?? Math.floor(currentClicks * 0.8);
  const topSource = analytics?.referrerData?.[0]?.label || "Direct";

  const deviceData = analytics?.deviceData?.length
    ? analytics.deviceData
    : [
        { label: "Desktop", value: 0, color: "#3b82f6" },
        { label: "Mobile", value: 0, color: "#8b5cf6" },
      ];

  const browserData = analytics?.browserData?.length
    ? analytics.browserData
    : [
        { label: "Chrome", value: 0, color: "#f59e0b" },
        { label: "Safari", value: 0, color: "#06b6d4" },
      ];

  const locationData = analytics?.locationData?.length
    ? analytics.locationData
    : [{ label: "No visitors yet", value: 0 }];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit pl-0 hover:pl-2 transition-all gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/dashboard/links")}
        >
          <ArrowLeft size={16} />
          Back to Links
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {link.name || `/${link.shortCode}`}
                </h1>
                <span
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      link.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {link.isActive ? "Active" : "Archived"}
                </span>
              </div>
              {link.name && (
                <span className="text-sm font-mono font-medium text-primary">
                  /{link.shortCode}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5 max-w-md truncate">
                <Link
                  href={link.originalUrl}
                  target="_blank"
                  className="hover:underline flex items-center gap-1 truncate"
                >
                  {link.originalUrl} <ExternalLink size={12} />
                </Link>
              </div>
              <span className="hidden sm:inline text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                Created{" "}
                {new Date(link.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(fullShortUrl)}
              className="gap-2"
            >
              <Copy size={14} />
              Copy Link
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href={fullShortUrl} target="_blank">
                Visit Link <ExternalLink size={14} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={currentClicks.toLocaleString()}
          icon={MousePointer2}
          trend={currentClicks > 0 ? { value: 100, isPositive: true } : undefined}
        />
        <StatCard
          title="Unique Visitors"
          value={currentUniqueVisitors.toLocaleString()}
          icon={Users}
          trend={currentUniqueVisitors > 0 ? { value: 100, isPositive: true } : undefined}
        />
        <StatCard title="Top Source" value={topSource} icon={Globe} />
        <StatCard
          title="Top Country"
          value={locationData[0]?.label || "N/A"}
          icon={Globe}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Charts Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Row 1: Devices & Browsers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Devices"
              subtitle="Device types breakdown"
              data={deviceData}
              total={currentClicks}
            />
            <AnalyticsChart
              title="Browsers"
              subtitle="Top web browsers used"
              data={browserData}
              total={currentClicks}
            />
          </div>

          {/* Row 2: Locations & Referral Sources (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Visitor Locations"
              subtitle="Countries & regions"
              data={locationData}
              total={currentClicks}
            />
            <AnalyticsChart
              title="Top Sources"
              subtitle="Referrers & platforms"
              data={analytics?.referrerData?.length ? analytics.referrerData : [{ label: topSource || "Direct", value: currentClicks }]}
              total={currentClicks}
            />
          </div>

          {/* Recent Clicks Activity Log */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-foreground tracking-tight">
                  Recent Visitors Activity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live real-time activity stream for this link
                </p>
              </div>
              {analytics?.recentClicks && analytics.recentClicks.length > 0 && (
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Live Active
                </span>
              )}
            </div>

            {analytics?.recentClicks && analytics.recentClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/20">
                    <tr>
                      <th className="py-2 px-3 rounded-l-md">Time</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Platform</th>
                      <th className="py-2 px-3 rounded-r-md">Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {analytics.recentClicks.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap text-xs font-mono">
                          {new Date(c.clickedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap text-xs">
                          {c.country || "Unknown"}
                          {c.city && c.city !== "Unknown" ? ` (${c.city})` : ""}
                        </td>
                        <td className="py-2.5 px-3 text-primary font-medium whitespace-nowrap text-xs">
                          {c.referrer || "Direct"}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap text-xs">
                          {c.deviceType || "Desktop"} • {c.browser || "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                <Activity className="w-8 h-8 text-muted-foreground/40 mb-1" />
                <p className="text-sm font-medium">No live visitor events yet</p>
                <p className="text-xs text-muted-foreground/80">
                  Share this link to start capturing real-time visitor streams
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <LinkQrCard url={fullShortUrl} />

          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-base tracking-tight">Tracking Insights</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <span className="text-muted-foreground text-xs font-medium">Total Clicks</span>
                <span className="font-semibold text-foreground">{currentClicks}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <span className="text-muted-foreground text-xs font-medium">Unique Visitors</span>
                <span className="font-semibold text-foreground">{currentUniqueVisitors}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                <span className="text-muted-foreground text-xs font-medium">Top Platform</span>
                <span className="font-semibold text-primary">{topSource}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">Top Country</span>
                <span className="font-semibold text-foreground">{locationData[0]?.label || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

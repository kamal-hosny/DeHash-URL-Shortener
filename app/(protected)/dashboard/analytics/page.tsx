"use client";

import React from "react";
import { useLinkStore } from "@/store/linkStore";
import {
  MousePointer2,
  Users,
  Globe,
  Link2,
  ArrowRight,
} from "@/assets/icons";
import StatCard from "@/components/molecules/dashboard/StatCard";
import AnalyticsChart from "@/components/ui/AnalyticsChart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAggregateAnalyticsQuery } from "@/hooks/queries/useAnalyticsQuery";
import { usePrefetchLink } from "@/hooks/queries/useLinksQuery";

export default function AnalyticsPage() {
  const { links } = useLinkStore();
  const { data } = useAggregateAnalyticsQuery();
  const prefetchLink = usePrefetchLink();

  const totalClicks = data?.totalClicks ?? links.reduce((acc, link) => acc + link.clicks, 0);
  const totalLinks = data?.totalLinks ?? links.length;
  const uniqueVisitors = data?.uniqueVisitors ?? Math.floor(totalClicks * 0.85);
  const topSource = data?.topSource || "Direct";

  const deviceData = data?.deviceData?.length
    ? data.deviceData
    : [
        { label: "Desktop", value: 0, color: "#3b82f6" },
        { label: "Mobile", value: 0, color: "#8b5cf6" },
      ];

  const browserData = data?.browserData?.length
    ? data.browserData
    : [
        { label: "Chrome", value: 0, color: "#f59e0b" },
        { label: "Safari", value: 0, color: "#06b6d4" },
      ];

  const locationData = data?.locationData?.length
    ? data.locationData
    : [{ label: "No visitors yet", value: 0 }];

  const referrerData = data?.referrerData?.length
    ? data.referrerData
    : [{ label: topSource || "Direct", value: totalClicks }];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Analytics Overview
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              All-Time
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive real-time audience, geographical, and platform breakdown across all links.
          </p>
        </div>

        <Button variant="outline" asChild className="w-fit gap-2">
          <Link href="/dashboard/links">
            <Link2 size={16} /> Manage Links
          </Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointer2}
          trend={totalClicks > 0 ? { value: 100, isPositive: true } : undefined}
        />
        <StatCard
          title="Unique Visitors"
          value={uniqueVisitors.toLocaleString()}
          icon={Users}
          trend={uniqueVisitors > 0 ? { value: 100, isPositive: true } : undefined}
        />
        <StatCard
          title="Total Links"
          value={totalLinks.toLocaleString()}
          icon={Link2}
        />
        <StatCard
          title="Top Source"
          value={topSource}
          icon={Globe}
        />
      </div>

      {/* Charts Grid: Balanced 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Devices"
          subtitle="Device types used by your visitors"
          data={deviceData}
          total={totalClicks}
        />
        <AnalyticsChart
          title="Browsers"
          subtitle="Top browsers used to view your links"
          data={browserData}
          total={totalClicks}
        />
        <AnalyticsChart
          title="Top Locations"
          subtitle="Visitor countries and geographic regions"
          data={locationData}
          total={totalClicks}
        />
        <AnalyticsChart
          title="Top Referral Sources"
          subtitle="Social platforms and incoming websites"
          data={referrerData}
          total={totalClicks}
        />
      </div>

      {/* Top Performing Links Section */}
      {data?.topLinks && data.topLinks.length > 0 && (
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                Top Performing Links
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your highest converting links ranked by click volume
              </p>
            </div>
            <Link href="/dashboard/links">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                View All Links <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/20">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-md">Link</th>
                  <th className="py-2.5 px-3">Destination URL</th>
                  <th className="py-2.5 px-3 text-center">Clicks</th>
                  <th className="py-2.5 px-3 text-center">Top Country</th>
                  <th className="py-2.5 px-3 text-right rounded-r-md">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.topLinks.map((link) => (
                  <tr
                    key={link.id}
                    onMouseEnter={() => prefetchLink(link.id)}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {link.name || `/${link.shortCode}`}
                        </span>
                        <span className="text-xs font-mono text-primary font-medium">
                          /{link.shortCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-muted-foreground text-xs">
                      {link.originalUrl}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-foreground">
                      {link.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                        {link.topCountry || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                        <Link
                          href={`/dashboard/links/${link.id}`}
                          onMouseEnter={() => prefetchLink(link.id)}
                          onFocus={() => prefetchLink(link.id)}
                        >
                          Inspect <ArrowRight size={12} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Recent Visitors Stream */}
      <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Live Visitor Activity Stream
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time feed of recent visits across all active short links
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {data?.recentClicks && data.recentClicks.length > 0 && (
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Streaming Live
              </span>
            )}
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/analytics/logs">
                View All Logs <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </div>

        {data?.recentClicks && data.recentClicks.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/20">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-md">Time</th>
                    <th className="py-2.5 px-3">Link</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3 rounded-r-md">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.recentClicks.slice(0, 8).map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap text-xs font-mono">
                        {new Date(c.clickedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Link
                          href={`/r/${c.shortCode}`}
                          target="_blank"
                          className="font-mono text-xs text-primary hover:underline font-medium"
                        >
                          /{c.shortCode}
                        </Link>
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

            <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Showing latest {Math.min(data.recentClicks.length, 8)} of {data.recentClicks.length} recent events
              </span>
              <Link
                href="/dashboard/analytics/logs"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                Open Full Activity Logs <ArrowRight size={12} />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
            <span className="text-3xl">🌐</span>
            <p className="text-sm font-medium">No click events recorded yet</p>
            <p className="text-xs text-muted-foreground/80 max-w-sm">
              When visitors open any of your short links, their country, device, browser, and platform will appear here live.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

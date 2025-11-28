"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLinkStore } from "@/store/linkStore";
import {
  MousePointer2,
  Users,
  Globe,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Copy,
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
  const { links } = useLinkStore();
  const { toast } = useToast();
  const linkId = params.id as string;

  const link = useMemo(
    () => links.find((l) => l.id === linkId),
    [links, linkId]
  );

  if (!link) {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  const fullShortUrl = `${window.location.origin}/r/${link.shortCode}`;

  // Mock data for charts - specific to this link
  const deviceData = [
    {
      label: "Desktop",
      value: Math.floor(link.clicks * 0.6),
      color: "#3b82f6",
    },
    {
      label: "Mobile",
      value: Math.floor(link.clicks * 0.35),
      color: "#8b5cf6",
    },
    {
      label: "Tablet",
      value: Math.floor(link.clicks * 0.05),
      color: "#10b981",
    },
  ];

  const browserData = [
    {
      label: "Chrome",
      value: Math.floor(link.clicks * 0.55),
      color: "#f59e0b",
    },
    {
      label: "Safari",
      value: Math.floor(link.clicks * 0.25),
      color: "#06b6d4",
    },
    {
      label: "Firefox",
      value: Math.floor(link.clicks * 0.15),
      color: "#ec4899",
    },
    { label: "Edge", value: Math.floor(link.clicks * 0.05), color: "#6366f1" },
  ];

  const locationData = [
    { label: "United States", value: Math.floor(link.clicks * 0.4) },
    { label: "United Kingdom", value: Math.floor(link.clicks * 0.15) },
    { label: "Germany", value: Math.floor(link.clicks * 0.1) },
    { label: "India", value: Math.floor(link.clicks * 0.1) },
    { label: "Other", value: Math.floor(link.clicks * 0.25) },
  ];

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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                /{link.shortCode}
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
          value={link.clicks.toLocaleString()}
          icon={MousePointer2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Unique Visitors"
          value={Math.floor(link.clicks * 0.8).toLocaleString()}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg. Engagement"
          value="45s"
          icon={Calendar} // Placeholder
        />
        <StatCard title="Top Source" value="Direct" icon={Globe} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Charts Column */}
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnalyticsChart
              title="Devices"
              data={deviceData}
              total={link.clicks}
            />
            <AnalyticsChart
              title="Browsers"
              data={browserData}
              total={link.clicks}
            />
          </div>
          <AnalyticsChart
            title="Top Locations"
            data={locationData}
            total={link.clicks}
          />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <LinkQrCard url={fullShortUrl} />

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-4">Link Insights</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                This link is performing <strong>better than 85%</strong> of your
                other links.
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-xs uppercase font-semibold tracking-wider mb-2">
                  Recommendation
                </p>
                <p>
                  Consider sharing this link on LinkedIn to reach more
                  professional users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

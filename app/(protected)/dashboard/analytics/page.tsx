"use client";

import { useLinkStore } from "@/store/linkStore";
import { MousePointer2, Users, Globe, Link2 } from "@/assets/icons";
import StatCard from "@/components/molecules/dashboard/StatCard";
import AnalyticsChart from "@/components/ui/AnalyticsChart";

export default function AnalyticsPage() {
  const { links } = useLinkStore();

  // Aggregate stats from all links
  const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);
  const totalLinks = links.length;

  // Mock data for charts - in a real app this would come from an API
  const deviceData = [
    {
      label: "Desktop",
      value: Math.floor(totalClicks * 0.6),
      color: "#3b82f6",
    },
    {
      label: "Mobile",
      value: Math.floor(totalClicks * 0.35),
      color: "#8b5cf6",
    },
    {
      label: "Tablet",
      value: Math.floor(totalClicks * 0.05),
      color: "#10b981",
    },
  ];

  const browserData = [
    {
      label: "Chrome",
      value: Math.floor(totalClicks * 0.55),
      color: "#f59e0b",
    },
    {
      label: "Safari",
      value: Math.floor(totalClicks * 0.25),
      color: "#06b6d4",
    },
    {
      label: "Firefox",
      value: Math.floor(totalClicks * 0.15),
      color: "#ec4899",
    },
    { label: "Edge", value: Math.floor(totalClicks * 0.05), color: "#6366f1" },
  ];

  const locationData = [
    { label: "United States", value: Math.floor(totalClicks * 0.4) },
    { label: "United Kingdom", value: Math.floor(totalClicks * 0.15) },
    { label: "Germany", value: Math.floor(totalClicks * 0.1) },
    { label: "India", value: Math.floor(totalClicks * 0.1) },
    { label: "Other", value: Math.floor(totalClicks * 0.25) },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into your link performance and audience.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointer2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Unique Visitors"
          value={Math.floor(totalClicks * 0.8).toLocaleString()}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Links"
          value={totalLinks.toLocaleString()}
          icon={Link2}
        />
        <StatCard title="Top Source" value="Direct" icon={Globe} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalyticsChart title="Devices" data={deviceData} total={totalClicks} />
        <AnalyticsChart
          title="Browsers"
          data={browserData}
          total={totalClicks}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          {/* Placeholder for a timeline chart if we had one, or just another breakdown */}
          <AnalyticsChart
            title="Top Locations"
            data={locationData}
            total={totalClicks}
          />
        </div>
        <div></div>
      </div>
    </div>
  );
}

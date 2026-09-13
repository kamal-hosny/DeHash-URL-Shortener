"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  MousePointer2,
  Users,
  Activity,
  Plus,
  ArrowRight,
  Globe,
} from "@/assets/icons";
import StatCard from "@/components/molecules/dashboard/StatCard";
import LinkList from "@/components/molecules/dashboard/LinkList";
import CreateLinkModal from "@/components/molecules/dashboard/modals/CreateLinkModal";
import { useLinkStore } from "@/store/linkStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardAnalytics {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  topSource: string;
  topCountry: string;
  topLinks?: Array<{
    id: string;
    name?: string;
    shortCode: string;
    originalUrl: string;
    clicks: number;
    topCountry?: string;
    topReferrer?: string;
    isActive: boolean;
  }>;
}

const DashboardPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { links, setLinks } = useLinkStore();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  // Sync real-time analytics from backend & Redis
  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data);
        }
      })
      .catch((err) => console.warn("Failed to load dashboard analytics:", err));

    // Also fetch fresh links
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLinks(data);
        }
      })
      .catch((err) => console.warn("Failed to sync links on dashboard:", err));
  }, [setLinks]);

  // Fallback to local store calculations
  const localClicks = links.reduce((acc, link) => acc + link.clicks, 0);
  const totalLinks = analytics?.totalLinks ?? links.length;
  const totalClicks = analytics?.totalClicks ?? localClicks;
  const activeLinks = analytics?.activeLinks ?? links.filter((l) => l.isActive).length;
  const uniqueVisitors = analytics?.uniqueVisitors ?? Math.floor(totalClicks * 0.85);
  const topSource = analytics?.topSource || "Direct";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your link growth, visitor analytics, and engagement in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="hidden sm:flex gap-1.5">
            <Link href="/dashboard/analytics">
              View Full Analytics <ArrowRight size={15} />
            </Link>
          </Button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 
              bg-primary hover:bg-primary/90
              text-primary-foreground
              font-medium rounded-md
              transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Create Link
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Links"
          value={totalLinks.toLocaleString()}
          icon={Link2}
          trend={totalLinks > 0 ? { value: 100, isPositive: true } : undefined}
        />
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
          title="Top Source"
          value={topSource}
          icon={Globe}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8">
        <LinkList />
      </div>

      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;

"use client";
import { useState } from "react";
import {
  Link2,
  MousePointer2,
  BarChart3,
  Activity,
  Plus,
} from "@/assets/icons";
import StatCard from "@/components/molecules/dashboard/StatCard";
import LinkList from "@/components/molecules/dashboard/LinkList";
import CreateLinkModal from "@/components/molecules/dashboard/modals/CreateLinkModal";
import { useLinkStore } from "@/store/linkStore";

const DashboardPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { links } = useLinkStore();

  // Calculate stats
  const totalLinks = links.length;
  const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);
  const activeLinks = links.filter((link) => link.isActive).length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your link growth and engagement in one place.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 
            bg-primary hover:bg-primary/90
            text-primary-foreground
            font-medium rounded-md
            transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Link
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Links"
          value={totalLinks}
          icon={Link2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointer2}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard title="Active Links" value={activeLinks} icon={Activity} />
        <StatCard
          title="Avg. CTR"
          value="4.2%"
          icon={BarChart3}
          trend={{ value: 2, isPositive: false }}
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

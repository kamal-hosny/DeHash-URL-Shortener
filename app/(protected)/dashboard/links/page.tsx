"use client";

import { useState } from "react";
import { useLinkStore } from "@/store/linkStore";
import { Plus } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import CreateLinkModal from "@/components/molecules/dashboard/modals/CreateLinkModal";
import { useLinksFilter } from "@/hooks/useLinksFilter";
import LinksToolbar from "@/components/molecules/dashboard/LinksToolbar";
import LinksTable from "@/components/molecules/dashboard/LinksTable";

export default function LinksPage() {
  const { links } = useLinkStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredAndSortedLinks,
  } = useLinksFilter(links);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Links
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage, track, and share your shortened links.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Create Link
        </Button>
      </div>

      {/* Filters and Search */}
      <LinksToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Links Table */}
      <LinksTable
        links={filteredAndSortedLinks}
        showEmptyState={searchQuery !== "" || statusFilter !== "all"}
        onClearFilters={handleClearFilters}
      />

      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

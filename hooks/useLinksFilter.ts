import { useState, useMemo } from "react";
import { Link as LinkType } from "@/store/linkStore";

export const useLinksFilter = (links: LinkType[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const filteredAndSortedLinks = useMemo(() => {
    let result = [...links];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (link) =>
          link.shortCode.toLowerCase().includes(query) ||
          link.originalUrl.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((link) => link.isActive === isActive);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "clicks-desc":
          return b.clicks - a.clicks;
        case "clicks-asc":
          return a.clicks - b.clicks;
        case "alpha-asc":
          return a.shortCode.localeCompare(b.shortCode);
        case "alpha-desc":
          return b.shortCode.localeCompare(a.shortCode);
        default:
          return 0;
      }
    });

    return result;
  }, [links, searchQuery, statusFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredAndSortedLinks,
  };
};

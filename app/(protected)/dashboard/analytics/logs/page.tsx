"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Download,
  Copy,
  ExternalLink,
  Activity,
  Globe,
  Users,
  Smartphone,
  Check,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/molecules/dashboard/StatCard";
import { useVisitorLogsQuery } from "@/hooks/queries/useAnalyticsQuery";
import { useToast } from "@/hooks/useToast";
import { ClickItem } from "@/lib/api/types";

export default function VisitorActivityLogsPage() {
  const { toast } = useToast();
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShortCode, setSelectedShortCode] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [selectedReferrer, setSelectedReferrer] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch visitor logs with optional 5s polling when live streaming is enabled
  const { data, isLoading, isFetching, refetch } = useVisitorLogsQuery(
    {
      limit: 500, // Fetch top 500 recent events for client-side search & filtering
      shortCode: selectedShortCode !== "all" ? selectedShortCode : undefined,
    },
    { refetchInterval: isLive ? 5000 : false }
  );

  const rawLogs = useMemo(() => data?.logs || [], [data?.logs]);
  const availableLinks = useMemo(() => data?.links || [], [data?.links]);

  // Derive unique referrers & devices for filter dropdowns
  const availableReferrers = useMemo(() => {
    const set = new Set<string>();
    rawLogs.forEach((l) => {
      if (l.referrer) set.add(l.referrer);
    });
    return Array.from(set);
  }, [rawLogs]);

  const availableDevices = useMemo(() => {
    const set = new Set<string>();
    rawLogs.forEach((l) => {
      if (l.deviceType) set.add(l.deviceType);
    });
    return Array.from(set);
  }, [rawLogs]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      // Filter by shortcode
      if (selectedShortCode !== "all" && log.shortCode?.toLowerCase() !== selectedShortCode.toLowerCase()) {
        return false;
      }
      // Filter by device
      if (selectedDevice !== "all" && log.deviceType?.toLowerCase() !== selectedDevice.toLowerCase()) {
        return false;
      }
      // Filter by referrer
      if (selectedReferrer !== "all" && log.referrer !== selectedReferrer) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = log.shortCode?.toLowerCase().includes(query);
        const matchName = log.linkName?.toLowerCase().includes(query);
        const matchCountry = log.country?.toLowerCase().includes(query);
        const matchCity = log.city?.toLowerCase().includes(query);
        const matchRef = log.referrer?.toLowerCase().includes(query);
        const matchDev = log.deviceType?.toLowerCase().includes(query);
        const matchBrowser = log.browser?.toLowerCase().includes(query);
        const matchIp = log.ipAddress?.toLowerCase().includes(query);
        const matchUrl = log.originalUrl?.toLowerCase().includes(query);
        return matchCode || matchName || matchCountry || matchCity || matchRef || matchDev || matchBrowser || matchIp || matchUrl;
      }
      return true;
    });
  }, [rawLogs, selectedShortCode, selectedDevice, selectedReferrer, searchTerm]);

  // Summary Metrics
  const totalEvents = filteredLogs.length;
  const uniqueCountriesCount = useMemo(() => {
    const set = new Set<string>();
    filteredLogs.forEach((l) => {
      if (l.country && l.country !== "Unknown") set.add(l.country);
    });
    return set.size;
  }, [filteredLogs]);

  const topDevice = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach((l) => {
      const dev = l.deviceType || "Desktop";
      counts[dev] = (counts[dev] || 0) + 1;
    });
    let top = "N/A";
    let max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        top = k;
      }
    });
    return top;
  }, [filteredLogs]);

  const topPlatform = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach((l) => {
      const ref = l.referrer || "Direct";
      counts[ref] = (counts[ref] || 0) + 1;
    });
    let top = "Direct";
    let max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        top = k;
      }
    });
    return top;
  }, [filteredLogs]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safeCurrentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: `Copied "${text}" to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No logs to export",
        description: "There are no activity logs matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Timestamp (UTC)",
      "Short Code",
      "Link Name",
      "Original URL",
      "Country",
      "City",
      "Platform / Referrer",
      "Device",
      "Browser",
      "IP Address",
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.clickedAt || ""}"`,
      `"${log.shortCode || ""}"`,
      `"${(log.linkName || "").replace(/"/g, '""')}"`,
      `"${(log.originalUrl || "").replace(/"/g, '""')}"`,
      `"${log.country || "Unknown"}"`,
      `"${log.city || "Unknown"}"`,
      `"${log.referrer || "Direct"}"`,
      `"${log.deviceType || "Desktop"}"`,
      `"${log.browser || "Unknown"}"`,
      `"${log.ipAddress || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor-activity-logs-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Completed",
      description: `Exported ${filteredLogs.length} activity records to CSV.`,
    });
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedShortCode !== "all" ||
    selectedDevice !== "all" ||
    selectedReferrer !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedShortCode("all");
    setSelectedDevice("all");
    setSelectedReferrer("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground h-8 text-xs"
        >
          <Link href="/dashboard/analytics">
            <ArrowLeft size={14} /> Back to Analytics Overview
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Visitor Activity Logs
              </h1>
              {isLive ? (
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Streaming
                </span>
              ) : (
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  Streaming Paused
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time audit stream of all incoming clicks, geolocations, devices, and traffic platforms across your links.
            </p>
          </div>

          {/* Stream Controls & Export */}
          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="text-xs gap-1.5 h-9"
            >
              <Activity size={14} />
              {isLive ? "Pause Live Stream" : "Resume Live Stream"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs gap-1.5 h-9"
            >
              <span className={`h-2 w-2 rounded-full bg-primary ${isFetching ? "animate-ping" : ""}`} />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs gap-1.5 h-9"
            >
              <Download size={14} />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Logged Events"
          value={totalEvents.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title="Unique Countries"
          value={uniqueCountriesCount.toLocaleString()}
          icon={Globe}
        />
        <StatCard
          title="Top Traffic Source"
          value={topPlatform}
          icon={Users}
        />
        <StatCard
          title="Primary Device"
          value={topDevice}
          icon={Smartphone}
        />
      </div>

      {/* Filtering & Search Toolbar */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by link, location, referrer, browser, or IP address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Link Filter */}
          <select
            aria-label="Filter by link"
            value={selectedShortCode}
            onChange={(e) => {
              setSelectedShortCode(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Short Links</option>
            {availableLinks.map((l) => (
              <option key={l.id} value={l.shortCode}>
                /{l.shortCode} {l.name ? `(${l.name})` : ""}
              </option>
            ))}
          </select>

          {/* Device Filter */}
          <select
            aria-label="Filter by device"
            value={selectedDevice}
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Devices</option>
            {availableDevices.map((dev) => (
              <option key={dev} value={dev}>
                {dev}
              </option>
            ))}
          </select>

          {/* Referrer Filter */}
          <select
            aria-label="Filter by traffic source"
            value={selectedReferrer}
            onChange={(e) => {
              setSelectedReferrer(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Traffic Sources</option>
            {availableReferrers.map((ref) => (
              <option key={ref} value={ref}>
                {ref}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Activity Logs Table */}
      <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
        {isLoading && filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-3">
            <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Loading visitor activity logs...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/20">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Short Link</th>
                    <th className="py-3 px-4 font-semibold">Destination</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Platform</th>
                    <th className="py-3 px-4 font-semibold">Device & Browser</th>
                    <th className="py-3 px-4 font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginatedLogs.map((log, idx) => {
                    const date = new Date(log.clickedAt);
                    const formattedDate = date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                    const formattedTime = date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <tr
                        key={log.id || `${log.clickedAt}-${idx}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-foreground font-medium">
                              {formattedTime}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formattedDate}
                            </span>
                          </div>
                        </td>

                        {/* Short Link */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/r/${log.shortCode}`}
                              target="_blank"
                              className="font-mono text-xs text-primary hover:underline font-semibold"
                            >
                              /{log.shortCode}
                            </Link>
                            {log.shortCode && (
                              <button
                                onClick={() => handleCopy(`/${log.shortCode}`, log.id || String(idx))}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy short code"
                              >
                                {copiedId === (log.id || String(idx)) ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            )}
                          </div>
                          {log.linkName && (
                            <span className="text-[11px] text-muted-foreground block truncate max-w-[120px]">
                              {log.linkName}
                            </span>
                          )}
                        </td>

                        {/* Destination */}
                        <td className="py-3 px-4 max-w-xs truncate text-xs text-muted-foreground">
                          {log.originalUrl ? (
                            <a
                              href={log.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-foreground hover:underline inline-flex items-center gap-1 truncate max-w-[200px]"
                              title={log.originalUrl}
                            >
                              <span className="truncate">{log.originalUrl}</span>
                              <ExternalLink size={10} className="shrink-0" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4 whitespace-nowrap text-xs">
                          <span className="font-medium text-foreground">
                            {log.country || "Unknown"}
                          </span>
                          {log.city && log.city !== "Unknown" && (
                            <span className="text-muted-foreground ml-1">
                              ({log.city})
                            </span>
                          )}
                        </td>

                        {/* Platform / Referrer */}
                        <td className="py-3 px-4 whitespace-nowrap text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {log.referrer || "Direct"}
                          </span>
                        </td>

                        {/* Device & Browser */}
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {log.deviceType || "Desktop"}
                          </span>
                          {" • "}
                          <span>{log.browser || "Unknown"}</span>
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {log.ipAddress ? (
                            <span>{log.ipAddress}</span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="py-3.5 px-4 border-t border-border/60 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  aria-label="Rows per page"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">
                  Showing {(safeCurrentPage - 1) * pageSize + 1}–
                  {Math.min(safeCurrentPage * pageSize, filteredLogs.length)} of{" "}
                  {filteredLogs.length} events
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage <= 1}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <ArrowLeft size={12} /> Previous
                </Button>
                <span className="font-mono px-2">
                  {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safeCurrentPage >= totalPages}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  Next <ArrowRight size={12} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3">
            <span className="text-4xl">🌐</span>
            <p className="text-base font-semibold text-foreground">
              {hasActiveFilters ? "No matching activity records" : "No visitor click events yet"}
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              {hasActiveFilters
                ? "Try adjusting or clearing your search filters to find the activity records you're looking for."
                : "When visitors click on any of your short links, live analytics containing their geolocation, platform, device, and timestamp will stream here automatically."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


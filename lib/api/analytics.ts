import { AggregateAnalyticsResponse, VisitorLogsParams, VisitorLogsResponse } from "./types";

/**
 * Pure API client for aggregate analytics
 */

export async function fetchAggregateAnalytics(): Promise<AggregateAnalyticsResponse> {
  const res = await fetch("/api/analytics", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch aggregate analytics: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Pure API client for visitor activity logs
 */
export async function fetchVisitorLogs(
  params?: VisitorLogsParams
): Promise<VisitorLogsResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  if (params?.shortCode) query.set("shortCode", params.shortCode);
  if (params?.search) query.set("search", params.search);

  const url = `/api/analytics/logs${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch visitor logs: ${res.statusText}`);
  }

  return res.json();
}


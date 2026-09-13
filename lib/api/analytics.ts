import { AggregateAnalyticsResponse } from "./types";

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


import { useQuery } from "@tanstack/react-query";
import { fetchAggregateAnalytics, fetchVisitorLogs } from "@/lib/api/analytics";
import { fetchLinkAnalytics } from "@/lib/api/links";
import { queryKeys } from "@/lib/queries/queryKeys";
import { VisitorLogsParams } from "@/lib/api/types";

/**
 * Hook to fetch and cache aggregate dashboard analytics.
 */
export function useAggregateAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.analytics.aggregate(),
    queryFn: fetchAggregateAnalytics,
    staleTime: 60 * 1000, // 1 minute fresh
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
  });
}

/**
 * Hook to fetch and cache link-specific real-time analytics.
 * If this link was preloaded on hover via usePrefetchLink, this query resolves instantly from cache!
 */
export function useLinkAnalyticsQuery(linkId: string) {
  return useQuery({
    queryKey: queryKeys.links.analytics(linkId),
    queryFn: () => fetchLinkAnalytics(linkId),
    enabled: Boolean(linkId),
    staleTime: 30 * 1000, // 30 seconds for real-time click stream
    gcTime: 5 * 60 * 1000, // 5 minutes retention
  });
}

/**
 * Hook to fetch visitor activity logs with live streaming auto-refetch option.
 */
export function useVisitorLogsQuery(
  params?: VisitorLogsParams,
  options?: { refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: queryKeys.analytics.logs(params as Record<string, unknown>),
    queryFn: () => fetchVisitorLogs(params),
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}


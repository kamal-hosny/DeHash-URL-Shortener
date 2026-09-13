import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { fetchLinks, createLink, deleteLink, fetchLinkAnalytics } from "@/lib/api/links";
import { queryKeys } from "@/lib/queries/queryKeys";
import { useLinkStore, Link } from "@/store/linkStore";
import { CreateLinkInput } from "@/lib/api/types";

/**
 * Hook to fetch and cache user links with TanStack Query.
 * Automatically keeps the Zustand store synchronized for backwards compatibility.
 */
export function useLinksQuery() {
  const setLinks = useLinkStore((state) => state.setLinks);

  const query = useQuery({
    queryKey: queryKeys.links.lists(),
    queryFn: fetchLinks,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sync to local store whenever fresh data arrives
  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setLinks(query.data);
    }
  }, [query.data, setLinks]);

  return query;
}

/**
 * Mutation to create a new shortened link.
 * Updates the cache immediately and invalidates related queries.
 */
export function useCreateLinkMutation() {
  const queryClient = useQueryClient();
  const addLinkToStore = useLinkStore((state) => state.addLink);

  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: (data) => {
      if (data.success && data.link) {
        // Optimistically update the list in cache
        queryClient.setQueryData<Link[]>(queryKeys.links.lists(), (old) => {
          if (!old) return [data.link!];
          const filtered = old.filter((l) => l.shortCode.toLowerCase() !== data.link!.shortCode.toLowerCase());
          return [data.link!, ...filtered];
        });

        // Sync with Zustand store
        addLinkToStore(data.link);

        // Invalidate aggregate analytics so stats refresh automatically
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      }
    },
  });
}

/**
 * Mutation to delete a shortened link.
 * Removes from cache and local store and invalidates queries.
 */
export function useDeleteLinkMutation() {
  const queryClient = useQueryClient();
  const removeLinkFromStore = useLinkStore((state) => state.removeLink);

  return useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: (_, id) => {
      // Remove from query cache
      queryClient.setQueryData<Link[]>(queryKeys.links.lists(), (old) => {
        if (!old) return [];
        return old.filter((l) => l.id !== id);
      });

      // Remove from Zustand store
      removeLinkFromStore(id);

      // Invalidate queries to stay in sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

/**
 * Hook for preloading (prefetching) link analytics data before the user navigates to it.
 * Designed to be attached to onMouseEnter / onFocus events on link items and inspect buttons.
 */
export function usePrefetchLink() {
  const queryClient = useQueryClient();

  return useCallback(
    (linkId: string) => {
      if (!linkId) return;

      queryClient.prefetchQuery({
        queryKey: queryKeys.links.analytics(linkId),
        queryFn: () => fetchLinkAnalytics(linkId),
        staleTime: 60 * 1000, // Preloaded data remains fresh for 1 minute
      });
    },
    [queryClient]
  );
}


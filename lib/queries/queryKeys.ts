/**
 * Centralized Query Key Factory
 * Ensures consistent, type-safe cache keys and predictable cache invalidations.
 */

export const queryKeys = {
  links: {
    all: ["links"] as const,
    lists: () => [...queryKeys.links.all, "list"] as const,
    detail: (id: string) => [...queryKeys.links.all, "detail", id] as const,
    analytics: (id: string) => [...queryKeys.links.all, "analytics", id] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    aggregate: () => [...queryKeys.analytics.all, "aggregate"] as const,
  },
} as const;


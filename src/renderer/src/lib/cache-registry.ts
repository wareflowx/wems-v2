// Cache Registry - Type-safe cache configuration for ORPC procedures
// Provides centralized cache invalidation rules per entity

import type { QueryKey } from "@tanstack/react-query";

// Mutation cache configuration
export interface MutationCacheConfig<TInput = unknown> {
  // Query keys to invalidate after mutation succeeds
  invalidate?: QueryKey[];
  // Function to create optimistic data for cache updates
  optimisticFn?: (input: TInput) => Record<string, unknown>;
  // Query keys to update optimistically
  setQueryData?: QueryKey[];
}

// Pre-defined entity cache configurations
export const agencyCache = {
  queries: {
    list: ["agencies", "list"] as QueryKey,
    detail: (id: number) => ["agencies", "detail", id] as QueryKey,
  },
  mutations: {
    create: {
      invalidate: [["agencies", "list"]] as QueryKey[],
      setQueryData: [["agencies", "list"]] as QueryKey[],
      optimisticFn: (input: {
        name: string;
        code?: string;
        isActive?: boolean;
      }) => ({
        ...input,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      }),
    } as MutationCacheConfig<{
      name: string;
      code?: string;
      isActive?: boolean;
    }>,
    update: {
      invalidate: [["agencies", "list"]] as QueryKey[],
      setQueryData: [["agencies", "list"]] as QueryKey[],
    } as MutationCacheConfig,
    delete: {
      invalidate: [["agencies", "list"]] as QueryKey[],
      setQueryData: [["agencies", "list"]] as QueryKey[],
    } as MutationCacheConfig<number>,
  },
};

export const employeeCache = {
  queries: {
    list: ["employees", "list"] as QueryKey,
    detail: (id: number) => ["employees", "detail", id] as QueryKey,
  },
  mutations: {
    create: {
      invalidate: [
        ["employees", "list"],
        ["contracts", "list"],
      ] as QueryKey[],
      setQueryData: [["employees", "list"]] as QueryKey[],
    } as MutationCacheConfig,
    update: {
      invalidate: [
        ["employees", "list"],
        ["contracts", "list"],
      ] as QueryKey[],
      setQueryData: [["employees", "list"]] as QueryKey[],
    } as MutationCacheConfig,
    delete: {
      invalidate: [
        ["employees", "list"],
        ["trash", "deleted-employees"],
      ] as QueryKey[],
      setQueryData: [["employees", "list"]] as QueryKey[],
    } as MutationCacheConfig<number>,
  },
};

export const contractCache = {
  queries: {
    list: ["contracts", "list"] as QueryKey,
    detail: (id: number) => ["contracts", "detail", id] as QueryKey,
  },
  mutations: {
    create: {
      invalidate: [
        ["contracts", "list"],
        ["employees", "list"],
      ] as QueryKey[],
      setQueryData: [["contracts", "list"]] as QueryKey[],
    } as MutationCacheConfig,
    update: {
      invalidate: [
        ["contracts", "list"],
        ["employees", "list"],
      ] as QueryKey[],
      setQueryData: [["contracts", "list"]] as QueryKey[],
    } as MutationCacheConfig,
    delete: {
      invalidate: [["contracts", "list"]] as QueryKey[],
      setQueryData: [["contracts", "list"]] as QueryKey[],
    } as MutationCacheConfig<number>,
  },
};

// Helper to build query key from path segments
export function buildQueryKey(...segments: string[]): QueryKey {
  return segments;
}

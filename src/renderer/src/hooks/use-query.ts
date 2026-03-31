// Generic useQuery hook for ORPC procedures
// Usage: const { data } = useQuery(() => ipc.client.database.getAgencies(), { cacheKey: ['agencies', 'list'] })

import { useQuery as useRQQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useORPCReady } from "./use-orpc-ready";
import type { QueryKey } from "@tanstack/react-query";

export type QueryFunction<T = unknown> = () => Promise<T>;

export interface UseORPCQueryOptions<TData = unknown, TError = unknown>
  extends Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  cacheKey?: QueryKey;
}

/**
 * Generic useQuery hook for ORPC procedures
 *
 * Usage:
 * ```typescript
 * const { data } = useQuery(
 *   () => ipc.client.database.getAgencies(),
 *   { cacheKey: ['agencies', 'list'] }
 * );
 * ```
 *
 * For better type inference, use with a typed query function:
 * ```typescript
 * const { data } = useQuery<Agency[]>(
 *   () => ipc.client.database.getAgencies(),
 *   { cacheKey: queryKeys.agencies.lists() }
 * );
 * ```
 */
export function useQuery<TData = unknown, TError = unknown>(
  queryFn: QueryFunction<TData>,
  options?: UseORPCQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const orpcReady = useORPCReady();

  return useRQQuery<TData, TError>({
    queryKey: options?.cacheKey ?? (["query"] as QueryKey),
    queryFn,
    enabled: orpcReady,
    ...options,
  });
}

/**
 * Hook for queries that need dynamic cache keys
 */
export function useDynamicQuery<TData = unknown, TError = unknown>(
  queryFn: QueryFunction<TData>,
  getCacheKey: () => QueryKey,
  options?: UseORPCQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const orpcReady = useORPCReady();
  const cacheKey = getCacheKey();

  return useRQQuery<TData, TError>({
    queryKey: cacheKey,
    queryFn,
    enabled: orpcReady,
    ...options,
  });
}

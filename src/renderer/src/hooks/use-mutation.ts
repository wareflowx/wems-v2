// Generic useMutation hook for ORPC procedures with optimistic updates
//
// Usage:
//   const create = useMutation(
//     (data) => ipc.client.database.createAgency(data),
//     {
//       invalidate: [["agencies", "list"]],
//       setQueryData: [["agencies", "list"]],
//       optimisticFn: (input) => ({ ...input, id: Date.now() }),
//     }
//   );

import type {
  MutationFunction,
  QueryKey,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  useQueryClient,
  useMutation as useRQMutation,
} from "@tanstack/react-query";
import { useToast } from "@/utils/toast";

/**
 * Context returned from onMutate for rollback on error
 */
interface OptimisticContext {
  previousData: Map<string, unknown>;
}

/**
 * Configuration for mutation with optimistic updates
 */
export interface MutationOptions<TInput = unknown, TOutput = unknown> {
  /** Query keys to invalidate after success */
  invalidate?: QueryKey[];
  /** Query keys to optimistically update */
  setQueryData?: QueryKey[];
  /** Function to create optimistic data */
  optimisticFn?: (input: TInput) => Partial<TOutput>;
  /** Custom error handler (receives context for rollback) */
  onError?: (
    error: unknown,
    input: TInput,
    context: OptimisticContext | undefined
  ) => void;
  /** Custom success handler */
  onSuccess?: (data: TOutput, input: TInput) => void;
}

/**
 * Generic useMutation hook with optimistic updates support
 *
 * @example
 * ```typescript
 * const create = useMutation(
 *   (data) => ipc.client.database.createAgency(data),
 *   {
 *     invalidate: [["agencies", "list"]],
 *     setQueryData: [["agencies", "list"]],
 *     optimisticFn: (input) => ({ ...input, id: Date.now() }),
 *   }
 * );
 *
 * // Usage
 * create.mutate({ name: "New Agency" });
 * ```
 */
export function useMutation<TInput, TOutput, TError = unknown>(
  mutationFn: MutationFunction<TOutput, TInput>,
  options?: MutationOptions<TInput, TOutput>
): UseMutationResult<TOutput, TError, TInput, OptimisticContext> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Snapshot queries for potential rollback
  function snapshot(keys: QueryKey[]): Map<string, unknown> {
    const snapshot = new Map<string, unknown>();
    keys.forEach((key) => {
      const data = queryClient.getQueryData(key);
      if (data !== undefined) {
        snapshot.set(JSON.stringify(key), data);
      }
    });
    return snapshot;
  }

  // Rollback to previous state
  function rollback(snapshotData: Map<string, unknown>) {
    snapshotData.forEach((data, keyStr) => {
      queryClient.setQueryData(JSON.parse(keyStr), data);
    });
  }

  // Apply optimistic update
  function applyOptimistic(input: TInput) {
    if (!(options?.setQueryData && options?.optimisticFn)) {
      return;
    }

    const optimisticData = options.optimisticFn(input);
    options.setQueryData.forEach((key) => {
      queryClient.setQueryData(key, (old: unknown) => {
        if (Array.isArray(old)) {
          return [...old, optimisticData];
        }
        return old;
      });
    });
  }

  return useRQMutation<TOutput, TError, TInput, OptimisticContext>({
    mutationFn,

    onMutate: async (input) => {
      // Cancel any outgoing refetches
      if (options?.setQueryData) {
        await queryClient.cancelQueries({ queryKey: options.setQueryData });
      }

      // Snapshot current state for rollback
      const previousData = options?.setQueryData
        ? snapshot(options.setQueryData)
        : new Map<string, unknown>();

      // Optimistically update
      applyOptimistic(input);

      return { previousData };
    },

    onError: (error, input, context) => {
      // Rollback to previous state
      if (context?.previousData) {
        rollback(context.previousData);
      }

      // Show error toast
      toast({
        title: "Operation failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });

      // Call custom error handler if provided
      options?.onError?.(error, input, context);
    },

    onSuccess: (_data, input) => {
      // Invalidate queries to refetch
      if (options?.invalidate) {
        options.invalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Call custom success handler if provided
      options?.onSuccess?.(_data, input);
    },
  });
}

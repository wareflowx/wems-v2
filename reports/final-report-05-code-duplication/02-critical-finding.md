# CRITICAL Finding: Unused Generic useMutation Hook

## Finding

The report correctly identifies `src/renderer/src/hooks/use-mutation.ts` exists but is **completely unused** by all entity hooks. This is the highest-priority finding.

## Current State

- Generic hook provides: optimistic updates, automatic rollback, toast notifications, query invalidation
- All 8 entity hooks implement these patterns manually
- Each manual implementation is 40-80 lines of nearly identical code

## Code Comparison

```typescript
// EXISTING GENERIC HOOK (use-mutation.ts) - Well designed!
export function useMutation<TInput, TOutput, TError = unknown>(
  mutationFn: MutationFunction<TOutput, TInput>,
  options?: MutationOptions<TInput, TOutput>
): UseMutationResult<...> {
  // Built-in: snapshot, rollback, optimistic update, toast, invalidation
}

// CURRENT ENTITY HOOK (use-agencies.ts) - Manual implementation
export function useCreateAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => db.createAgency(data),
    onMutate: async (newAgency) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agencies.lists() });
      const previousQueries = new Map();
      queryClient.getQueriesData({ queryKey: queryKeys.agencies.lists() }).forEach(...)
      queryClient.setQueriesData({ queryKey: queryKeys.agencies.lists() }, (old=[]) => [...old, {...}]);
      return { previousQueries };
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) { context.previousQueries.forEach(...) }
      toast({ title: "Failed to create agency", ... });
    },
    onSuccess: () => { queryClient.invalidateQueries(...) }
  });
}
```

## Why the Generic Hook Isn't Being Used

The generic hook is missing features that entity hooks need:

1. **Duplicate name validation** - `useCreateAgency` has case-insensitive duplicate checking
2. **Cross-query invalidation** - `useCreateEmployee` invalidates both `employees.lists()` AND `contracts.lists()`
3. **Success toast messages** - The generic hook only shows error toasts

## Recommended Approach

1. **Extend the generic hook** to support the missing patterns
2. **Create a CRUD factory** that generates entity-specific hooks with validation built-in
3. **Migrate incrementally** one entity at a time

## Proposed Enhanced Generic Hook

```typescript
interface CrudMutationOptions<TInput, TOutput> {
  invalidate: QueryKey[][];  // Multiple query key arrays
  setQueryData?: QueryKey[][];
  optimisticFn?: (input: TInput) => Partial<TOutput>;
  duplicateCheck?: {
    queryKey: QueryKey;
    field: keyof TInput;
    message: string;
  };
  onError?: (error: unknown, input: TInput, context?: OptimisticContext) => void;
  onSuccess?: (data: TOutput, input: TInput) => void;
  successMessage?: string;
}
```

## Impact Assessment

| Metric | Value |
|--------|-------|
| **Effort to extend and adopt** | 1-2 days |
| **Lines saved** | ~1,200 |
| **Risk** | LOW |
| **Priority** | CRITICAL |

---

*Critical finding confirmed by senior peer review*

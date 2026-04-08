# HIGH Priority: CRUD Hook Factory Pattern

## Overview

Beyond extending the existing generic hook, a comprehensive CRUD Hook Factory Pattern is recommended for long-term maintainability and type-safe entity hook generation.

## Recommended Pattern: Entity Definition Schema

```typescript
// lib/entity-schemas.ts
import type { QueryKey } from "@tanstack/react-query";

interface EntitySchema<TInput, TOutput> {
  name: string;
  queryKeys: {
    lists: () => QueryKey;
    detail: (id: number) => QueryKey;
    byEmployee?: (employeeId: number) => QueryKey;
  };
  create: {
    fn: (input: TInput) => Promise<TOutput>;
    optimisticFn: (input: TInput) => TOutput;
    duplicateCheck?: { field: keyof TInput; message: string };
  };
  update: {
    fn: (input: TInput & { id: number }) => Promise<TOutput>;
    optimisticFn?: (current: TOutput, updates: Partial<TInput>) => TOutput;
  };
  delete: {
    fn: (id: number) => Promise<void>;
  };
}

// Example: const agencySchema: EntitySchema<CreateAgencyInput, Agency> = { ... }
```

## Benefits

| Benefit | Description |
|---------|-------------|
| **Type-safe** | Full TypeScript inference |
| **Declarative** | Entity behavior defined in one place |
| **Extensible** | Easy to add cross-cutting concerns |
| **Testable** | Schema can be validated with runtime checks |

## Usage Example

```typescript
// Before: 80+ lines per entity hook
export function useCreateAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => db.createAgency(data),
    onMutate: async (newAgency) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agencies.lists() });
      // ... 40-80 lines of boilerplate
    },
    // ...
  });
}

// After: 10 lines declarative definition
const agencyHooks = createCrudHooks(agencySchema, {
  invalidate: [queryKeys.agencies.lists(), queryKeys.employees.lists()],
  duplicateCheck: { field: 'name', message: 'Agency already exists' }
});

export const useCreateAgency = agencyHooks.create;
export const useUpdateAgency = agencyHooks.update;
export const useDeleteAgency = agencyHooks.delete;
```

## Impact Assessment

| Metric | Value |
|--------|-------|
| **Effort** | 3-5 days for full implementation |
| **Lines saved** | ~800 |
| **Risk** | MEDIUM |
| **Priority** | HIGH |

## Implementation Notes

- Design EntitySchema types (1 day)
- Build CRUD factory function (2 days)
- Migrate agencies hook to factory as proof of concept (1 day)
- Migrate remaining hooks incrementally (3-5 days)

---

*Recommended by senior architect review*

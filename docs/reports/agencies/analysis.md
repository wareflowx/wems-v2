# Agencies Page Analysis

**File:** `src/renderer/src/pages/agencies-page.tsx`
**Lines:** ~512
**Date:** 2026-03-30

---

## Executive Summary

The `agencies-page.tsx` implements a simple CRUD page for managing agencies. Despite its straightforward functionality, the file is excessively large and follows patterns that are duplicated across all entity pages in the application.

---

## Problems Identified

### 1. Unnecessary Hook Layer

**Current State:**
```typescript
const { data: agencies = [], isLoading, error } = useAgencies();
const createAgency = useCreateAgency();
const updateAgency = useUpdateAgency();
const deleteAgency = useDeleteAgency();
```

Each hook is a separate file of ~60-80 lines containing boilerplate for TanStack Query mutations with optimistic updates.

**Issue:** For a simple page like this, we need 4 separate hook files containing mostly identical patterns.

**Expected:**
```typescript
const { data } = useQuery(api.database.agencies.list);
const create = useMutation(api.database.agencies.create);
```

**Related:** Issue #175 - Generic CRUD hooks abstraction

---

### 2. Inline Dialog Components at Bottom of File

**Current State:**
The file defines three dialog components at the bottom:
- `CreateAgencyDialog` (lines 356-406)
- `EditAgencyDialog` (lines 408-471)
- `DeleteAgencyDialog` (lines 473-512)

**Issue:** These components are defined after the main `AgenciesPage` component. This violates the principle that components should be defined before they are used, making the code harder to follow.

**Recommendation:** Move each dialog to its own file or place all dialogs before the main component.

---

### 3. Duplicate Local State Management

**Current State:**
```typescript
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [editingAgency, setEditingAgency] = useState<any>(null);
const [deletingAgency, setDeletingAgency] = useState<any>(null);
```

**Issue:** Three separate state variables to manage three different dialogs. This pattern is repeated in every CRUD page.

**Recommendation:** Create a unified `useDialog` hook:
```typescript
const { isOpen, mode, entity, openCreate, openEdit, openDelete, close } = useDialog();
```

---

### 4. Hardcoded Query Keys

**Current State:**
```typescript
onRetry={() => queryClient.invalidateQueries({ queryKey: ["agencies"] })}
```

**Issue:** Query keys are hardcoded as strings instead of using the centralized `query-keys.ts` registry.

**Recommendation:** Use `queryKeys.agencies.lists()` for consistency and type safety.

---

### 5. Metrics Calculation in Render

**Current State:**
```typescript
const kpis = useMemo(
  () => ({
    totalAgencies: agencies.length,
    activeAgencies: agencies.filter((a) => a.isActive).length,
    inactiveAgencies: agencies.filter((a) => !a.isActive).length,
  }),
  [agencies]
);
```

**Issue:** KPI calculation logic is duplicated in every page with metrics. Should be a reusable hook.

**Recommendation:** Create `useMetrics<T>(data, config)` hook.

---

### 6. No Strong Typing

**Current State:**
```typescript
const [editingAgency, setEditingAgency] = useState<any>(null);
const [deletingAgency, setDeletingAgency] = useState<any>(null);
```

**Issue:** Using `any` for agency types loses TypeScript safety and IDE support.

**Recommendation:** Use inferred types from ORPC procedures:
```typescript
type Agency = Infer<typeof agencySchema>;
```

---

### 7. Duplicated Code Generation Logic

**Current State:**
```typescript
function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");
}
```

**Issue:** This function likely exists in multiple places (positions, departments, etc.) with slight variations.

**Recommendation:** Extract to shared utility `generateCode()` in `@/lib/utils`.

---

### 8. Filter Logic in Render

**Current State:**
```typescript
const filteredAgencies = useMemo(() => {
  return agencies.filter((agency) => {
    const matchesSearch = search === "" || agency.name.toLowerCase().includes(...);
    const matchesStatus = statusFilter === "all" || (...);
    return matchesSearch && matchesStatus;
  });
}, [agencies, search, statusFilter]);
```

**Issue:** Filter logic mixed with render logic.

**Recommendation:** Extract to `useFilteredData(data, filters)` hook.

---

## Code Statistics

| Metric | Value |
|--------|-------|
| Total lines | ~512 |
| Dialog components | 3 (inline) |
| Custom hooks imported | 4 |
| useState declarations | 7 |
| useMemo declarations | 2 |
| any types | 4+ |

---

## Impact

These issues are not specific to `agencies-page.tsx` - they represent **systemic patterns** repeated across all ~15 entity pages in the application:

- `employees-page.tsx`
- `contracts-page.tsx`
- `caces-page.tsx`
- `medical-visits-page.tsx`
- `departments-page.tsx`
- `positions-page.tsx`
- `work-locations-page.tsx`
- `contract-types-page.tsx`
- etc.

**Estimated total duplicate code:** ~1500-2000 lines of boilerplate that could be reduced with proper abstractions.

---

## Related Issues

- **#174** - Refactor ORPC handlers into modular router structure
- **#175** - Generic CRUD hooks abstraction over ORPC procedures

---

## Existing Patterns in Codebase

### 1. Query Keys Registry - Complete

**File:** `src/core/lib/query-keys.ts`

Query keys already exist for all entities in a hierarchical structure:

```typescript
export const queryKeys = {
  agencies: {
    all: ["agencies"] as const,
    lists: () => ["agencies", "list"] as const,
    list: (filters: string) => ["agencies", "list", filters] as const,
    details: () => ["agencies", "detail"] as const,
    detail: (id: number) => ["agencies", "detail", id] as const,
  },
  // ... other entities
};
```

**Status:** Ready to use - no changes needed for the CRUD abstraction.

---

### 2. Database Actions - Complete

**File:** `src/renderer/src/actions/database.ts`

CRUD functions already exist for agencies:

```typescript
export async function getAgencies() { ... }
export async function createAgency(data) { ... }
export async function updateAgency(data) { ... }
export async function deleteAgency(id) { ... }
```

**Status:** These will be replaced by direct ORPC calls once generic hooks are implemented.

---

### 3. Zod Schemas - Complete

**File:** `src/core/ipc/database/schemas.ts`

Agency input schemas already defined:

```typescript
export const createAgencyInputSchema = z.object({...});
export const updateAgencyInputSchema = z.object({...});
export const deleteAgencyInputSchema = z.object({...});
```

**Status:** Can be used for type inference in generic hooks.

---

### 4. TanStack Query Client - Complete

**File:** `src/core/lib/query-client.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5min, gcTime: 30min, retry: 1, ... },
    mutations: { retry: 1 },
  },
});
```

**Status:** Ready to use - no changes needed.

---

### 5. Dialog Store - Partial (Missing Agency Dialogs)

**File:** `src/renderer/src/stores/dialog-store.ts`

Zustand store exists but `DialogId` type is missing agency dialogs:

```typescript
export type DialogId =
  | "create-employee" | "edit-employee" | "delete-employee"
  // MISSING: "create-agency" | "edit-agency" | "delete-agency"
```

**Status:** Needs to add agency dialog IDs and integrate with `agencies-page.tsx`.

---

### 6. DialogManager - Incomplete

**File:** `src/renderer/src/components/dialogs/DialogManager.tsx`

Centralized dialog rendering exists but does NOT include agency dialogs.

**Status:** Needs to add agency dialogs or be redesigned for generic usage.

---

### 7. Generic Dialog Components - Partial

**Files:**
- `src/renderer/src/components/ui/add-item-dialog.tsx`
- `src/renderer/src/components/ui/edit-item-dialog.tsx`
- `src/renderer/src/components/ui/delete-confirm-dialog.tsx`

These handle single-field inputs (name only). Agency dialogs need multi-field forms (name, code, isActive).

**Status:** Need custom dialogs for complex forms or extend generic dialogs.

---

### 8. useORPCReady Hook - Complete

**File:** `src/renderer/src/hooks/use-orpc-ready.ts`

```typescript
export function useORPCReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

**Status:** Ready to use in generic hooks.

---

### 9. Toast Utility - Complete

**File:** `src/renderer/src/utils/toast.ts`

```typescript
export function toast({ title, description, variant = "default" }) { ... }
export function useToast() { return { toast }; }
```

**Status:** Ready to use in generic mutation hooks.

---

### 10. generateCode Utility - Duplicated

**Currently exists in:**
- `agencies-page.tsx` (lines 348-354)
- `CreatePositionDialog.tsx`
- `EditContractTypeDialog.tsx`
- `CreateContractTypeDialog.tsx`

**Status:** Should be extracted to `src/core/lib/utils.ts`:

```typescript
export function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");
}
```

---

## Infrastructure Status Summary

| Aspect | Status | File |
|--------|--------|------|
| Query Keys Registry | Ready | `src/core/lib/query-keys.ts` |
| Database Actions | Ready (to be replaced) | `src/renderer/src/actions/database.ts` |
| Zod Schemas | Ready | `src/core/ipc/database/schemas.ts` |
| Query Client | Ready | `src/core/lib/query-client.ts` |
| useORPCReady | Ready | `src/renderer/src/hooks/use-orpc-ready.ts` |
| Toast Utility | Ready | `src/renderer/src/utils/toast.ts` |
| Dialog Store | Partial | `src/renderer/src/stores/dialog-store.ts` |
| DialogManager | Incomplete | `src/renderer/src/components/dialogs/DialogManager.tsx` |
| Generic Dialogs | Partial | `src/renderer/src/components/ui/*.tsx` |
| generateCode | Duplicated | Needs extraction |

---

## Recommendations

### Phase 1: Quick Wins (No Breaking Changes)

1. **Extract `generateCode`** to `src/core/lib/utils.ts` and update all usages
2. **Fix hardcoded query keys** in `agencies-page.tsx` to use `queryKeys.agencies.lists()`
3. **Add agency dialog IDs** to `dialog-store.ts` DialogId type

### Phase 2: Generic Hooks (Issue #175)

4. Implement generic `useQuery` and `useMutation` hooks
5. Create `CacheRegistry` type for entity cache configuration
6. Migrate pages to use generic hooks

### Phase 3: Dialog Consolidation

7. Extend or replace generic dialog components for multi-field forms
8. Integrate all agency dialogs into DialogManager
9. Create unified `useDialog` hook

### Phase 4: Page Improvements

10. Extract filter logic to `useFilteredData` hook
11. Extract KPI calculation to `useMetrics` hook
12. Move inline dialogs to separate files
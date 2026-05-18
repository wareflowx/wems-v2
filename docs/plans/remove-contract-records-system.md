# Plan: Remove Contract Records System

**Date:** 2026-05-15
**Status:** Planned
**Goal:** Remove the `contracts` table while keeping `contract_types` lookup table. Employee status changes become manual via existing `employees.status` field (`active | on_leave | terminated`).

---

## Context

Currently, WEMS tracks employment contracts as separate records in a `contracts` table. Each employee can have multiple contracts with different types, start/end dates, and active status.

This creates complexity:
- Contract alerts are computed from end dates
- The `contracts` table is separate from `employees` despite being 1:1 in most cases
- Status management is split between `employees.status` and `contracts.isActive`
- No Zod validation on contract handlers
- No referential integrity between `contracts.contractType` and `contract_types.id`

**Desired state:**
- `contract_types` table remains as a lookup (CDI, CDD, Intérim, Alternance)
- Each employee has a `contractTypeId` FK pointing to `contract_types.id`
- Status changes handled manually via `employees.status`
- No more contract records, no more contract alerts

**No production data exists** — database will be reset completely.

---

## Phase 1: Database Schema Changes

### 1.1 Update Employees Schema

**File:** `src/core/db/schema/employees.ts`

Add `contractTypeId` column and import `contractTypes`:
```typescript
import { contractTypes } from "./contract-types";

// In employees table:
contractTypeId: integer("contract_type_id").references(() => contractTypes.id, {
  onDelete: "set null",
})
```

### 1.2 Delete Contracts Schema

**File:** `src/core/db/schema/contracts.ts`

Delete entire file.

### 1.3 Update Schema Index

**File:** `src/core/db/schema/index.ts`

Remove: `export * from "./contracts"` (line 9)

### 1.4 Database Reset

```bash
rm data/database.db
npm run db:push
```

---

## Phase 2: Backend IPC Handlers

### 2.1 Delete Contract Handlers

**File:** `src/core/ipc/database/handlers.ts`

Remove the following handlers (~lines 465-574):
- `getContracts`
- `getContractsByEmployee`
- `getActiveContractByEmployee`
- `createContract`
- `updateContract`
- `deleteContract`

### 2.2 Modify createEmployee Handler

**File:** `src/core/ipc/database/handlers.ts`

In `createEmployee` (around line 352):
- Remove `contractType`, `contractStartDate`, `contractEndDate` from input handling
- Remove embedded contract creation (lines 366-379)
- Remove manual rollback on contract failure (lines 376-379)

Add `contractTypeId` to employee insert.

### 2.3 Modify getAlerts Handler

**File:** `src/core/ipc/database/handlers.ts`

Around line 2138:
- Remove entire `contractAlerts` block that iterates over `allContracts`

### 2.4 Modify permanentDeleteEmployee Handler

**File:** `src/core/ipc/database/handlers.ts`

Around line 2378:
- Remove `.delete(contracts).where(eq(contracts.employeeId, validatedData.id))`

### 2.5 Update Database Router Index

**File:** `src/core/ipc/database/index.ts`

Remove all contract-related entries:
- Import lines: `createContract`, `deleteContract`, `getActiveContractByEmployee`, `getContracts`, `getContractsByEmployee`, `updateContract`
- Database object entries (lines 122-127): `getContracts`, `getContractsByEmployee`, `getActiveContractByEmployee`, `createContract`, `updateContract`, `deleteContract`

---

## Phase 3: Frontend Actions

### 3.1 Delete Contract Action Functions

**File:** `src/renderer/src/actions/database.ts`

Remove (~lines 244-290):
```typescript
getContracts()
getContractsByEmployee()
getActiveContractByEmployee()
createContract()
updateContract()
deleteContract()
```

---

## Phase 4: React Hooks

### 4.1 Delete use-contracts.ts

**File:** `src/renderer/src/hooks/use-contracts.ts`

Delete entire file.

### 4.2 Update hooks index

**File:** `src/renderer/src/hooks/index.ts`

Remove `useContracts` export.
`useContractTypes` should **remain**.

### 4.3 Update use-employees.ts

**File:** `src/renderer/src/hooks/use-employees.ts`

In `useCreateEmployee` hook, remove from `onSuccess`:
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() });
```

---

## Phase 5: Query Keys

### 5.1 Update query-keys.ts

**File:** `src/core/lib/query-keys.ts`

Remove `contracts` key definition (lines 13-24):
```typescript
// Contracts
contracts: {
  all: ["contracts"] as const,
  lists: () => ["contracts", "list"] as const,
  list: (filters: string) => ["contracts", "list", filters] as const,
  details: () => ["contracts", "detail"] as const,
  detail: (id: number) => ["contracts", "detail", id] as const,
  byEmployee: (employeeId: number) =>
    ["contracts", "byEmployee", employeeId] as const,
  activeByEmployee: (employeeId: number) =>
    ["contracts", "activeByEmployee", employeeId] as const,
},
```

---

## Phase 6: Page Components

### 6.1 Delete Contracts Page Route

**Files to delete:**
- `src/routes/contracts.tsx`
- `src/renderer/src/pages/contracts-page.tsx`

### 6.2 Delete Contract UI Components

**Files to delete:**
- `src/renderer/src/components/contracts/contract-table.tsx`
- `src/renderer/src/components/contracts/CreateContractDialog.tsx`
- `src/renderer/src/components/contracts/EditContractDialog.tsx`
- `src/renderer/src/components/contracts/DeleteContractDialog.tsx`
- `src/renderer/src/components/contracts/index.ts`

### 6.3 Update Employee Detail Page

**File:** `src/renderer/src/pages/employee-detail-page.tsx`

Changes:
1. Remove `useContracts` from imports
2. Remove `contracts` from data fetching
3. Remove `currentContract` useMemo (lines 67-81)
4. Remove `employeeContracts` useMemo (lines 115-120)
5. Remove contract display from info grid (lines 297-310)
6. Remove "Contracts History" section entirely (lines 313-365)
7. Update `EditEmployeeDialog` call to remove `contract` prop

### 6.4 Update CreateEmployeeDialog

**File:** `src/renderer/src/components/employees/CreateEmployeeDialog.tsx`

Changes:
1. Update `CreateEmployeeData` interface:
   - Remove `contractType: string` (line 72)
   - Remove `contractEndDate?: string` (line 77)
   - Add `contractTypeId?: number`

2. Remove contract type dropdown (lines 444-467) — replace with `contractTypeId` dropdown

3. Remove conditional contract end date field (lines 482-501)

4. Remove contract display from review step (lines 589-598)

5. Remove `getContractDisplay` function (lines 199-212)

6. Update form reset (lines 142-153)

### 6.5 Update EditEmployeeDialog

**File:** `src/renderer/src/components/employees/EditEmployeeDialog.tsx`

Changes:
1. Remove `Contract` interface (lines 62-69)

2. Remove `contract` prop from `EditEmployeeDialogProps` (line 76)

3. Update `EditEmployeeData` interface (lines 83-100):
   - Remove `contractType?: string`
   - Remove `contractStartDate?: string`
   - Remove `contractEndDate?: string`
   - Remove `contractIsActive?: boolean`
   - Add `contractTypeId?: number`

4. Add `contractTypes` prop to `EditEmployeeDialogProps`:
   ```typescript
   contractTypes?: { id: number; name: string; code: string }[];
   ```

5. Add contract type dropdown to UI

6. Update form initialization to use `contractTypeId`

7. Remove hardcoded `contractTypes` array (line 199)

### 6.6 Update employees-table.tsx

**File:** `src/renderer/src/components/employees/employees-table.tsx`

Changes:
1. Remove `Contract` import (line 2)
2. Remove `contracts` prop from `EmployeesTableProps` (line 52)
3. Remove all contract-related state and filtering (lines 65, 74-99, 106-117)
4. Remove contract column in table (lines 274-284)
5. Remove contract type badge display (lines 147-163)
6. Remove `agencyId` from contract (line 217)

### 6.7 Update employees-page.tsx

**File:** `src/renderer/src/pages/employees-page.tsx`

- Remove `contracts` prop from `EmployeesTable`
- Keep `contractTypes` prop for `CreateEmployeeDialog` (already passed)

---

## Phase 7: Dialog Management

### 7.1 Update Dialog Store

**File:** `src/renderer/src/stores/dialog-store.ts`

Remove:
- `"create-contract"`, `"edit-contract"`, `"delete-contract"` from `DialogType` (lines 22-24)
- `contractId` from `DialogState` (line 55)
- `contractTypeId` from `DialogState` — keep this, it's still needed for contract types

### 7.2 Update DialogManager

**File:** `src/renderer/src/components/dialogs/DialogManager.tsx`

Remove:
- `CreateContractDialog` import (line 11)
- `useCreateContract` import (line 24)
- `createContract` mutation (line 60)
- `"create-contract"` case (lines 135-144)

### 7.3 Update Quick Actions Dialog

**File:** `src/renderer/src/components/quick-actions-dialog.tsx`

Remove:
- "contracts" action (lines 113-116)
- "create-contract" action (lines 196-199)

---

## Phase 8: Navigation

### 8.1 Update Sidebar

**File:** `src/renderer/src/components/app-sidebar.tsx`

Remove the `NavItem` for `/contracts`:
```tsx
<NavItem
  icon={FileText}
  label={t("sidebar.contracts")}
  path="/contracts"
/>
```

**Keep:** Contract Types nav item in reference data section.

---

## Phase 9: Settings

### 9.1 Update Settings Page

**File:** `src/renderer/src/pages/settings-page.tsx`

Keep `contractAlerts` setting but make it a no-op:
- The toggle can remain in UI (won't break anything)
- Backend will ignore it since contract alerts are removed
- OR remove the toggle entirely for cleanliness

---

## Phase 10: Translations

### 10.1 Update French translations

**File:** `src/renderer/src/locales/fr.json`

Remove keys under `contracts.*` (around lines 164-176):
- `contracts.addContract`
- `contracts.addContractDescription`
- `contracts.allTypes`
- `contracts.allStatuses`
- `contracts.search`
- `contracts.type`
- `contracts.status`
- etc.

Keep `contractTypes.*` keys.

### 10.2 Update English translations

**File:** `src/renderer/src/locales/en.json`

Same removal as French.

---

## Phase 11: Scripts

### 11.1 Delete migration script

**File:** `scripts/migrate-contracts-agency.js`

Delete if exists.

---

## Implementation Order

1. **Schema** - Delete contracts.ts, update employees.ts with contractTypeId FK, update index.ts, reset DB
2. **Backend handlers** - Remove contract handlers from handlers.ts and index.ts
3. **Query keys** - Remove contracts from query-keys.ts
4. **Frontend actions** - Remove contract action functions from database.ts
5. **Hooks** - Delete use-contracts.ts, update index.ts, update use-employees.ts
6. **Dialog store** - Remove contract dialog types
7. **Dialog manager** - Remove contract dialog case
8. **Quick actions** - Remove contract actions
9. **Pages/Components** - Delete contracts page and components
10. **Employee table** - Remove contract columns and filtering
11. **Employee dialogs** - Update CreateEmployeeDialog and EditEmployeeDialog
12. **Employee detail** - Remove contract sections
13. **Navigation** - Remove sidebar item
14. **Translations** - Clean up contract keys
15. **Test** - Verify employee CRUD works, status changes work

---

## Files to Delete (Summary)

| Category | Files |
|----------|-------|
| Schema | `src/core/db/schema/contracts.ts` |
| Page | `src/routes/contracts.tsx`, `src/renderer/src/pages/contracts-page.tsx` |
| Components | `src/renderer/src/components/contracts/*` |
| Hooks | `src/renderer/src/hooks/use-contracts.ts` |
| Scripts | `scripts/migrate-contracts-agency.js` |

## Files to Modify (Summary)

| File | Changes |
|------|---------|
| `src/core/db/schema/employees.ts` | Add `contractTypeId` column with FK to contractTypes |
| `src/core/db/schema/index.ts` | Remove `contracts` export |
| `src/core/ipc/database/handlers.ts` | Remove contract handlers, modify createEmployee, remove alerts |
| `src/core/ipc/database/index.ts` | Remove contract imports and database entries |
| `src/renderer/src/actions/database.ts` | Remove contract functions |
| `src/renderer/src/hooks/index.ts` | Remove useContracts export |
| `src/renderer/src/hooks/use-employees.ts` | Remove contracts invalidation |
| `src/core/lib/query-keys.ts` | Remove contracts key |
| `src/renderer/src/stores/dialog-store.ts` | Remove contract dialog types and contractId |
| `src/renderer/src/components/dialogs/DialogManager.tsx` | Remove contract dialog case |
| `src/renderer/src/components/quick-actions-dialog.tsx` | Remove contract actions |
| `src/renderer/src/pages/employee-detail-page.tsx` | Remove contract sections |
| `src/renderer/src/components/employees/employees-table.tsx` | Remove contract columns and filtering |
| `src/renderer/src/components/employees/EditEmployeeDialog.tsx` | Remove contract prop, add contractTypeId |
| `src/renderer/src/components/employees/CreateEmployeeDialog.tsx` | Remove contractType/contractEndDate fields |
| `src/renderer/src/pages/employees-page.tsx` | Remove contracts prop from table |
| `src/renderer/src/components/app-sidebar.tsx` | Remove contracts nav item |
| `src/renderer/src/locales/fr.json` | Remove contracts translations |
| `src/renderer/src/locales/en.json` | Remove contracts translations |
| `src/renderer/src/pages/settings-page.tsx` | Keep or remove contractAlerts toggle |

---

## Testing Checklist

- [ ] Employee creation still works
- [ ] Employee creation form has contract type dropdown (FK to contract_types)
- [ ] Employee edit dialog has contract type dropdown
- [ ] Employee edit still works (including status change)
- [ ] Contract type stored as FK, not string
- [ ] Contract types page still works
- [ ] Can assign contract type to employee
- [ ] No /contracts route
- [ ] No contract-related queries in DevTools
- [ ] Alerts page doesn't show contract alerts
- [ ] CreateEmployeeDialog: contract end date field removed
- [ ] EditEmployeeDialog: no contract prop, uses contractTypeId
- [ ] Employees table: no contract columns
- [ ] DialogManager: no contract dialog case
- [ ] Quick actions: no "create contract" action
- [ ] Sidebar: no contracts nav item
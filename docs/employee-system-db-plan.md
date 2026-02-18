# Employee Management System - Database Implementation Plan

## Overview

This document outlines the implementation plan for migrating the employee management system from mock data to a database-backed solution with foreign keys to reference tables.

## Simplified Scope (Phase 1)

**This phase focuses on core employee data without the contract management system.**

- ✅ Positions (already implemented)
- ✅ Work Locations (already implemented)
- ✅ Employees (in progress)
- ❌ Contracts - **NOT in scope** - will be handled in a future phase
- ❌ Departments - **NOT in scope** - kept as string field

## Current State

### Mock Data Structure (`src/mock-data/employees.ts`)

```typescript
interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  contract: string      // "CDI", "CDD", "Intérim", "Alternance" - STAYING AS STRING
  job: string          // → positionId (FK)
  department: string   // → STAYING AS STRING for now
  location: string    // → workLocationId (FK)
  status: string      // "active", "on_leave", "terminated"
  hireDate: string    // "2020-03-15"
}
```

### Reference Tables Status

| Table | Status | Fields |
|-------|--------|--------|
| `positions` | ✅ Done | id, code, name, color, isActive, timestamps |
| `work_locations` | ✅ Done | id, code, name, color, isActive, timestamps |
| `contract_types` | ❌ Not in scope | Will be handled later |
| `departments` | ❌ Not in scope | Kept as string field |

### Hooks Status

| Hook File | Status |
|-----------|--------|
| `use-positions-worklocations.ts` | ✅ Done - Uses DB |
| `use-employees.ts` | 🔴 Uses mock - needs migration |
| `use-reference-data.ts` | 🟡 Partial - some use mock, some use DB |

## Proposed Database Schema

### 1. Employees Table (New)

```typescript
// src/db/schema/employees.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'
import { positions } from './positions'
import { workLocations } from './work-locations'

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Personal info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),

  // Employment references (FK)
  positionId: integer('position_id').references(() => positions.id),
  workLocationId: integer('work_location_id').references(() => workLocations.id),

  // Keep as string for now (contracts will be handled later)
  contract: text('contract').notNull(),         // "CDI", "CDD", etc.
  department: text('department').notNull(),     // "Production", "RH", etc.

  // Status & dates
  status: text('status').notNull(), // 'active' | 'on_leave' | 'terminated'
  hireDate: text('hire_date').notNull(),
  terminationDate: text('termination_date'),

  // Metadata
  ...timestamps,
})

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
```

### 2. Relationships

```
employees
├── positionId ──────────► positions (id)
├── workLocationId ──────► work_locations (id)
├── contract ────────────► (string field, future FK)
└── department ─────────► (string field, future FK)
```

## Data Migration

### Current Mock Data Mapping

| Field (Mock) | New Field | Mapping Notes |
|--------------|-----------|---------------|
| `firstName` | `firstName` | Direct |
| `lastName` | `lastName` | Direct |
| `email` | `email` | Direct |
| `phone` | `phone` | Direct |
| `job` | `positionId` | Lookup by name → positions.id |
| `location` | `workLocationId` | Lookup by name → work_locations.id |
| `contract` | `contract` | Direct (kept as string) |
| `department` | `department` | Direct (kept as string) |
| `status` | `status` | Map: "Actif" → "active", "En congé" → "on_leave", etc. |
| `hireDate` | `hireDate` | Direct |

### Sample Migration Script

```typescript
// Migration from mock data
const mockEmployees = [...]; // from src/mock-data/employees.ts

const migratedEmployees = mockEmployees.map(emp => ({
  firstName: emp.firstName,
  lastName: emp.lastName,
  email: emp.email,
  phone: emp.phone,
  positionId: positions.find(p => p.name === emp.job)?.id,
  workLocationId: workLocations.find(w => w.name === emp.location)?.id,
  contract: emp.contract,         // Keep as string
  department: emp.department,     // Keep as string
  status: mapStatus(emp.status),
  hireDate: emp.hireDate,
}));

// Status mapping
function mapStatus(status: string): string {
  const mapping: Record<string, string> = {
    'Actif': 'active',
    'En congé': 'on_leave',
    'Terminé': 'terminated',
  };
  return mapping[status] || 'active';
}
```

## Implementation Order

### Phase 0: Reference Tables (Already Done ✅)
- ✅ `positions` table
- ✅ `work_locations` table
- ✅ Hooks: `usePositions`, `useCreatePosition`, etc.
- ✅ Hooks: `useWorkLocations`, `useCreateWorkLocation`, etc.

### Phase 1: Contract Types (Foundation)
1. Create `contract_types` schema
2. Generate migration
3. Push to database
4. Add seed data (CDI, CDD, Intérim, Alternance)
5. Add DB functions in `src/actions/database.ts`
6. Add hook `useContractTypes` → point to DB

### Phase 2: Employees Table (Core)
1. Create `employees` schema with FKs
2. Generate migration
3. Push to database

### Phase 3: Backend Integration
1. Add RPC handlers for employees (CRUD)
2. Add Zod schemas in `src/ipc/database/schemas.ts`
3. Export DB functions in `src/actions/database.ts`
4. **Update hooks**:
   - `useEmployees` → use `db.getEmployees()`
   - `useCreateEmployee` → use `db.createEmployee()`
   - `useUpdateEmployee` → use `db.updateEmployee()`
   - `useDeleteEmployee` → use `db.deleteEmployee()`

### Phase 4: UI Updates
1. Update employees page to use DB data
2. Replace string selects with FK dropdowns (use `usePositions`, `useWorkLocations`)
3. Display position/location badges from DB
4. Handle status changes properly

### Phase 5: Data Migration
1. Create migration script
2. Import existing mock data to DB
3. Verify data integrity
4. Delete `src/mock-data/employees.ts`

## Open Questions

### 1. Departments
**Question**: Should departments be a reference table or kept as free text?

- **Option A**: Create `departments` table (like positions)
  - Pros: Consistent, can add metadata, filter by active/inactive
  - Cons: More setup, may restrict flexibility

- **Option B**: Keep as string field
  - Pros: Simple, flexible
  - Cons: Inconsistent with other fields, no metadata

**Recommendation**: Create departments table for consistency.

### 2. Contract History
**Question**: Should contracts be a separate table with history?

- **Current**: Contract info stored directly on employee
- **Option A**: Single contract per employee (current)
- **Option B**: Separate `contracts` table with history
  - Pros: Track contract changes over time
  - Cons: More complex, more UI work

**Recommendation**: Start with Option A (single contract), migrate to Option B if needed.

### 3. Status Values
**Question**: Should status be free text or enum-like?

**Current values**:
- "Actif" (Active)
- "En congé" (On leave)
- "Terminé" (Terminated)

**Proposed** (in database):
- `active`
- `on_leave`
- `terminated`

**Recommendation**: Use consistent codes in DB, translate for display.

## Hooks Analysis

### Current Hooks State

| Hook | Current Source | Target Source | Status |
|------|----------------|---------------|--------|
| `useEmployees` | `@/api/employees` (mock) | `@/actions/database` | 🔴 To migrate |
| `useEmployee` | `@/api/employees` (mock) | `@/actions/database` | 🔴 To migrate |
| `useCreateEmployee` | `@/api/employees` (mock) | `@/actions/database` | 🔴 To migrate |
| `useUpdateEmployee` | `@/api/employees` (mock) | `@/actions/database` | 🔴 To migrate |
| `useDeleteEmployee` | `@/api/employees` (mock) | `@/actions/database` | 🔴 To migrate |
| `usePositions` | `@/actions/database` | - | 🟢 OK |
| `useWorkLocations` | `@/actions/database` | - | 🟢 OK |
| `useContractTypes` | `@/api/reference` (mock) | `@/actions/database` | 🔴 To migrate |
| `useDepartments` | `@/api/reference` (mock) | Keep as string | 🟡 Optional |
| `useJobTitles` | `@/api/reference` (mock) | Use `usePositions` instead | 🔴 Remove |

### Changes Required for use-employees.ts

**Current (mock)**:
```typescript
interface CreateEmployeeInput {
  job: string       // "Technicien"
  location: string // "Paris"
}
```

**New (DB)**:
```typescript
interface CreateEmployeeInput {
  positionId: number       // FK → positions.id
  workLocationId: number    // FK → work_locations.id
}
```

**Required changes**:
1. Change source from `employeesApi` → `db.getEmployees()`
2. Update types to use `positionId` / `workLocationId` instead of strings
3. Add relations to Employee type for display (`position: { name, color }`, `workLocation: { name, color }`)
4. Mutations must send FK IDs, not string names

### Changes Required for use-reference-data.ts

| Hook | Action |
|------|--------|
| `useContractTypes` | Change from `@/api/reference` to `db.getContractTypes()` |
| `useDepartments` | Keep as-is (string field, optional future table) |
| `useJobTitles` | **Remove** - replaced by `usePositions` |

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/db/schema/contract-types.ts` | Contract types schema |
| `src/db/schema/employees.ts` | Employees schema |
| `src/api/contract-types.ts` | Contract types API (if needed) |

### Modified Files

| File | Changes |
|------|---------|
| `src/db/schema/index.ts` | Export new schemas |
| `src/db/migrations/` | New migration files |
| `src/ipc/database/handlers.ts` | Add CRUD handlers for employees, contract_types |
| `src/ipc/database/schemas.ts` | Add Zod schemas |
| `src/ipc/database/index.ts` | Export new handlers |
| `src/actions/database.ts` | Add DB functions (getEmployees, createEmployee, etc.) |
| `src/lib/query-keys.ts` | Add query keys for employees (if not exists) |
| `src/hooks/use-employees.ts` | **Refactor**: Switch from mock to DB, update types |
| `src/hooks/use-reference-data.ts` | **Refactor**: useContractTypes → DB, remove useJobTitles |
| `src/api/employees.ts` | Deprecate (or keep for fallback) |
| `src/pages/employees-page.tsx` | Use DB with FK dropdowns |

### Deleted Files

| File | Reason |
|------|--------|
| `src/mock-data/employees.ts` | Replaced by database |

### Removed Hooks

| Hook | Reason |
|------|--------|
| `useJobTitles` | Replaced by `usePositions` (already implemented) |

## Testing Strategy

1. **Unit Tests**
   - Schema validation
   - Data migration script
   - Status mapping

2. **Integration Tests**
   - CRUD operations via RPC
   - Foreign key constraints
   - Query performance

3. **UI Tests**
   - Form submission
   - Display of related data
   - Filter functionality

## Next Steps

1. Approve this plan
2. Create contract_types table
3. Create employees table
4. Implement RPC routes
5. Connect UI

---

*Last updated: 2026-02-18*
*Updated: Added hooks analysis section*

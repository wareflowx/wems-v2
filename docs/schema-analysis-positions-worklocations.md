# Schema Analysis: Positions (Job Titles) and Work Locations

## Current State

### Positions (Job Titles)

**In reference data** (`src/mock-data/reference.ts`):
```typescript
export const jobTitles = [
  'Opérateur',
  'Technicien',
  'Comptable',
  'Responsable RH',
  'Commercial',
]
```

**In employees** (`src/mock-data/employees.ts`):
```typescript
{
  job: 'Technicien',           // Simple string
  department: 'Production',     // Separated from job
}
```

**Current API** (`src/api/reference.ts`):
- ✅ GET `/job-titles` - Get all positions
- ✅ POST `/job-titles` - Add a position
- ✅ PUT `/job-titles` - Update a position
- ✅ DELETE `/job-titles` - Delete a position

**UI Usage**:
- Badges with colors by position (ex: `operator` → `bg-emerald-500`)
- Filter by position in employees page
- Managed in Settings → Reference Data

### Work Locations

**In employees** (`src/mock-data/employees.ts`):
```typescript
{
  location: 'Paris',           // Simple string
}
```

**Existing values**:
- Paris
- Lyon
- Marseille
- Lille

**Current API**:
- ❌ NOT YET IMPLEMENTED

**UI Usage** (`src/pages/employees-page.tsx`):
```typescript
const getWorkLocationBadge = (location: string) => {
  const locationColors: { [key: string]: string } = {
    "Site A": "bg-cyan-500",
    "Site B": "bg-amber-500",
    "Site C": "bg-violet-500",
  };
  // ...
}
```

⚠️ **INCOHERENCE DETECTED**: Data has "Paris", "Lyon", etc. but code uses "Site A", "Site B", "Site C"

**Sidebar** (`src/components/app-sidebar.tsx`):
- "Add work location" button with unimplemented onClick
```typescript
<SidebarMenuButton
  tooltip={t("sidebar.addWorkLocation")}
  onClick={() => setIsWorkLocationDialogOpen(true)}
>
```

**Translations** (`src/locales/fr.json`):
- `sidebar.addWorkLocation`: "Ajouter un lieu de travail"
- `settings.createWorkLocation`: "Créer un lieu de travail"
- `settings.locationNamePlaceholder`: "Ex: Site A, Usine B..."

## Requirements Analysis

### Positions (Job Titles) ✅ Well Structured

**Current**: Simple string list with CRUD implemented
**Future**: Simplified table with only essential fields

**Identified needs**:
1. ✅ Basic CRUD already implemented
2. 🔄 Migrate to structured table with:
   - Unique code (ex: "TECHNICIAN", "OPERATOR")
   - Display name (ex: "Technicien", "Opérateur")
   - Active/inactive status

### Work Locations ❌ To Implement

**Current**: Simple strings in employees
**Future**: Complete table

**Identified needs**:
1. ❌ CRUD to implement
2. 🔄 Table structure:
   - Unique code (ex: "SITE_PARIS", "SITE_LYON")
   - Display name (ex: "Site Paris", "Site Lyon")
   - Active/inactive status

## Proposed Drizzle Schemas

### 1. Positions Table

```typescript
// src/db/schema/positions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // ex: "TECHNICIAN", "OPERATOR"
  name: text('name').notNull(), // ex: "Technicien", "Opérateur"
  color: text('color').notNull(), // ex: "bg-emerald-500", "bg-amber-500"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Position = typeof positions.$inferSelect
export type NewPosition = typeof positions.$inferInsert
```

**Primary/Unique keys**:
- PK: `id`
- UK: `code`

**Recommended indexes**:
- `idx_positions_is_active` on `isActive`
- `idx_positions_code` on `code`

### 2. Work Locations Table

```typescript
// src/db/schema/work-locations.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const workLocations = sqliteTable('work_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // ex: "SITE_PARIS", "FACTORY_LYON"
  name: text('name').notNull(), // ex: "Site Paris", "Usine Lyon"
  color: text('color').notNull(), // ex: "bg-cyan-500", "bg-amber-500"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type WorkLocation = typeof workLocations.$inferSelect
export type NewWorkLocation = typeof workLocations.$inferInsert
```

**Primary/Unique keys**:
- PK: `id`
- UK: `code`

**Recommended indexes**:
- `idx_work_locations_is_active` on `isActive`
- `idx_work_locations_code` on `code`

### 3. Employees Table (Not in scope - Future)

> **Note**: Updating the employees table with FKs to positions and work_locations is **not in the current scope**. The employees will continue to use string fields (`job`, `location`) from mock data for now.

The following schema is documented for reference only, to be implemented later when employees are migrated to the database.

```typescript
// src/db/schema/employees.ts - FUTURE, NOT CURRENTLY PLANNED
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { positions } from './positions'
import { workLocations } from './work-locations'

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Personal info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),

  // Employment
  positionId: integer('position_id').references(() => positions.id),
  workLocationId: integer('work_location_id').references(() => workLocations.id),

  // Contract (reference to contract_types table)
  contractTypeId: integer('contract_type_id'),

  // Status
  status: text('status').notNull(), // 'active' | 'on_leave' | 'terminated'
  hireDate: text('hire_date').notNull(),
  terminationDate: text('termination_date'),

  // Timestamps
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
```

**Relations** (for future reference):
- `positionId` → `positions.id` (Many-to-One)
- `workLocationId` → `work_locations.id` (Many-to-One)
- `contractTypeId` → `contract_types.id` (Many-to-One)

## Data Migration

### Current Positions → New Table

```typescript
// Current data
const currentJobTitles = [
  'Opérateur',
  'Technicien',
  'Comptable',
  'Responsable RH',
  'Commercial',
]

// Migration to new structure
const positionMigration = [
  { code: 'OPERATOR', name: 'Opérateur', color: 'bg-emerald-500', isActive: true },
  { code: 'TECHNICIAN', name: 'Technicien', color: 'bg-blue-500', isActive: true },
  { code: 'ACCOUNTANT', name: 'Comptable', color: 'bg-amber-500', isActive: true },
  { code: 'HR_MANAGER', name: 'Responsable RH', color: 'bg-violet-500', isActive: true },
  { code: 'SALES_REP', name: 'Commercial', color: 'bg-cyan-500', isActive: true },
]
```

### Current Work Locations → New Table

```typescript
// Current data (from employees)
const currentLocations = ['Paris', 'Lyon', 'Marseille', 'Lille']

// Migration to new structure
const workLocationMigration = [
  { code: 'SITE_PARIS', name: 'Site Paris', color: 'bg-cyan-500', isActive: true },
  { code: 'SITE_LYON', name: 'Site Lyon', color: 'bg-amber-500', isActive: true },
  { code: 'SITE_MARSEILLE', name: 'Site Marseille', color: 'bg-violet-500', isActive: true },
  { code: 'SITE_LILLE', name: 'Site Lille', color: 'bg-emerald-500', isActive: true },
]
```

## Open Questions

### 1. Code vs Name
**Question**: Should we separate code (technical identifier) and name (display)?
- **Pros**: Code is stable, name can be changed without breaking references
- **Cons**: More complex
- **Recommendation**: ✅ Yes, for stability and internationalization

## Next Steps (Current Scope)

1. ✅ **Create `positions` schema** (simplified structure)
2. ✅ **Create `work_locations` schema** (simplified structure)
3. ✅ **Generate Drizzle migrations**
4. 🔄 **Implement RPC routes for CRUD** (positions + work_locations)
5. 🔄 **Create seeds for test data**
6. 🔄 **Update UI components** (connect dialogs to backend)
7. 🔄 **Create dialogs for add/edit** (connect to mutations)
8. ✅ **Testing and validation**

## Out of Scope

- **Employees migration**: The employees table will continue using mock data with string fields (`job`, `location`). FK integration to positions and work_locations is deferred to a future phase.

## Suggested Implementation Order

```
1. positions        → independent reference table
2. work_locations   → independent reference table
3. RPC routes       → backend CRUD for positions + work_locations
4. UI integration   → connect dialogs to TanStack mutations
5. Seeds            → populate test data
```

## Summary of Changes

**Positions**:
- Replace string list with table
- Add `id` (primary key, auto-increment)
- Add `code` (unique identifier)
- Add `isActive` flag
- Add timestamps (`createdAt`, `updatedAt`)

**Work Locations**:
- New table (currently only strings in employees)
- Add `id` (primary key, auto-increment)
- Add `code` (unique identifier)
- Add `isActive` flag
- Add timestamps (`createdAt`, `updatedAt`)

**Employees**:
- *(Not in scope - continues using mock data with string fields)*

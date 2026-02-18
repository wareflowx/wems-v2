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

**Current**: Simple string list
**Future**: Table with metadata

**Identified needs**:
1. ✅ Basic CRUD already implemented
2. 🔄 Migrate to structured table for:
   - Unique code (ex: "TECH_LEAD", "OPERATOR_1")
   - Display name (ex: "Technicien", "Opérateur")
   - Description
   - Associated department (relation)
   - Badge color (for UI)
   - Base salary / salary scale
   - Active/inactive status

### Work Locations ❌ To Implement

**Current**: Simple strings in employees
**Future**: Complete table

**Identified needs**:
1. ❌ CRUD to implement
2. 🔄 Table structure:
   - Unique code (ex: "SITE_PARIS", "FACTORY_LYON")
   - Display name (ex: "Site Paris", "Usine Lyon")
   - Type (Site, Factory, Office, Warehouse)
   - Full address
   - City
   - Postal code
   - Country
   - GPS coordinates (lat, lng) - optional
   - Phone number
   - Contact email
   - Maximum capacity (employee count)
   - Manager (FK to employee or dedicated table)
   - Active/inactive status
   - Badge color (for UI)

## Proposed Drizzle Schemas

### 1. Positions Table

```typescript
// src/db/schema/positions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { departments } from './departments'

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Identifiers
  code: text('code').notNull().unique(), // ex: "TECH_LEAD", "OPERATOR"

  // Basic info
  name: text('name').notNull(), // ex: "Technicien", "Opérateur"
  description: text('description'), // Position description

  // Relations
  departmentId: integer('department_id').references(() => departments.id),

  // UI metadata
  badgeColor: text('badge_color').notNull().default('bg-gray-500'), // ex: "bg-emerald-500"

  // Salary
  baseSalary: integer('base_salary'), // Base salary in cents

  // Status
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Timestamps
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
- `idx_positions_department_id` on `departmentId`
- `idx_positions_is_active` on `isActive`
- `idx_positions_code` on `code`

### 2. Work Locations Table

```typescript
// src/db/schema/work-locations.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const workLocations = sqliteTable('work_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Identifiers
  code: text('code').notNull().unique(), // ex: "SITE_PARIS", "FACTORY_LYON"

  // Basic info
  name: text('name').notNull(), // ex: "Site Paris", "Usine Lyon"
  type: text('type').notNull(), // 'site' | 'factory' | 'office' | 'warehouse'

  // Address
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country').notNull().default('France'),

  // Coordinates
  latitude: real('latitude'), // For Google Maps
  longitude: real('longitude'),

  // Contact
  phone: text('phone'),
  email: text('email'),

  // Capacity
  maxCapacity: integer('max_capacity'), // Max employee count

  // Manager (optional - can be separate table)
  managerId: integer('manager_id'),

  // UI metadata
  badgeColor: text('badge_color').notNull().default('bg-gray-500'), // ex: "bg-cyan-500"

  // Status
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Timestamps
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type WorkLocation = typeof workLocations.$inferSelect
export type NewWorkLocation = typeof workLocations.$inferInsert
```

**Work location types**:
```typescript
type WorkLocationType = 'site' | 'factory' | 'office' | 'warehouse'
```

**Primary/Unique keys**:
- PK: `id`
- UK: `code`

**Recommended indexes**:
- `idx_work_locations_type` on `type`
- `idx_work_locations_city` on `city`
- `idx_work_locations_is_active` on `isActive`
- `idx_work_locations_code` on `code`

### 3. Employees Table (Updated)

```typescript
// src/db/schema/employees.ts
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

**Relations**:
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
  {
    code: 'OPERATOR',
    name: 'Opérateur',
    description: 'Production operator',
    departmentId: 1, // Production
    badgeColor: 'bg-emerald-500',
    baseSalary: 220000, // 2200€ in cents
  },
  {
    code: 'TECHNICIAN',
    name: 'Technicien',
    description: 'Maintenance technician',
    departmentId: 1, // Production
    badgeColor: 'bg-amber-500',
    baseSalary: 280000, // 2800€
  },
  {
    code: 'ACCOUNTANT',
    name: 'Comptable',
    description: 'Accountant',
    departmentId: 2, // Administration
    badgeColor: 'bg-indigo-500',
    baseSalary: 300000, // 3000€
  },
  {
    code: 'HR_MANAGER',
    name: 'Responsable RH',
    description: 'HR Manager',
    departmentId: 3, // RH
    badgeColor: 'bg-rose-500',
    baseSalary: 420000, // 4200€
  },
  {
    code: 'SALES_REP',
    name: 'Commercial',
    description: 'Sales representative',
    departmentId: 4, // Commercial
    badgeColor: 'bg-blue-500',
    baseSalary: 250000, // 2500€ + commissions
  },
]
```

### Current Work Locations → New Table

```typescript
// Current data (from employees)
const currentLocations = ['Paris', 'Lyon', 'Marseille', 'Lille']

// Migration to new structure
const workLocationMigration = [
  {
    code: 'SITE_PARIS',
    name: 'Site Paris',
    type: 'site',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    latitude: 48.8698,
    longitude: 2.3076,
    phone: '+33 1 23 45 67 89',
    email: 'paris@company.com',
    maxCapacity: 150,
    badgeColor: 'bg-cyan-500',
  },
  {
    code: 'SITE_LYON',
    name: 'Site Lyon',
    type: 'site',
    address: '45 Rue de la République',
    city: 'Lyon',
    postalCode: '69002',
    country: 'France',
    latitude: 45.7640,
    longitude: 4.8357,
    phone: '+33 4 56 78 90 12',
    email: 'lyon@company.com',
    maxCapacity: 200,
    badgeColor: 'bg-amber-500',
  },
  {
    code: 'FACTORY_MARSEILLE',
    name: 'Usine Marseille',
    type: 'factory',
    address: '78 Boulevard du Cap',
    city: 'Marseille',
    postalCode: '13007',
    country: 'France',
    latitude: 43.2965,
    longitude: 5.3698,
    phone: '+33 4 12 34 56 78',
    email: 'marseille@company.com',
    maxCapacity: 300,
    badgeColor: 'bg-violet-500',
  },
  {
    code: 'OFFICE_LILLE',
    name: 'Bureau Lille',
    type: 'office',
    address: '12 Grand Place',
    city: 'Lille',
    postalCode: '59000',
    country: 'France',
    latitude: 50.6293,
    longitude: 3.0573,
    phone: '+33 3 98 76 54 32',
    email: 'lille@company.com',
    maxCapacity: 50,
    badgeColor: 'bg-blue-500',
  },
]
```

## Open Questions

### 1. Code vs Name
**Question**: Should we separate code (technical identifier) and name (display)?
- **Pros**: Code is stable, name can be changed without breaking references
- **Cons**: More complex
- **Recommendation**: ✅ Yes, for stability and internationalization

### 2. Badge Colors
**Question**: How to handle colors?
- **Option A**: Predefined colors (5-10 colors)
- **Option B**: Custom hex colors
- **Option C**: Automatic color based on name hash
- **Recommendation**: Option A for UI consistency

### 3. Department Relation
**Question**: Is departments a table or just a string?
- **Observation**: Departments is currently in `reference.ts` like job titles
- **Recommendation**: ✅ Create a `departments` table with same structure as positions

### 4. Capacity vs Actual Headcount
**Question**: Should we track actual vs capacity?
- **Recommendation**: Calculate dynamically via `COUNT(employees)` per work location

### 5. Manager
**Question**: How to handle site manager?
- **Option A**: Direct FK to `employees`
- **Option B**: Dedicated table `location_managers`
- **Option C**: Simple text field
- **Recommendation**: Option A with nullable for simplicity

## Next Steps

1. ✅ **Create `departments` schema** (same logic as positions)
2. ✅ **Create `positions` schema** with metadata
3. ✅ **Create `work_locations` schema**
4. ✅ **Update `employees` schema** with FKs
5. ✅ **Generate Drizzle migrations**
6. ✅ **Create seeds for test data**
7. ✅ **Implement RPC routes for CRUD**
8. ✅ **Update UI components**
9. ✅ **Create dialogs for add/edit**
10. ✅ **Testing and validation**

## Suggested Migration Order

```
1. departments    → simplest, reference for positions
2. work_locations → independent, reference for employees
3. positions      → depends on departments
4. employees      → depends on positions + work_locations
```

## Summary of Changes

**Positions**:
- Add `code` (unique identifier)
- Add `description`
- Add `departmentId` (FK)
- Add `badgeColor`
- Add `baseSalary`
- Add `isActive` flag

**Work Locations**:
- New table with full address
- Type classification (site, factory, office, warehouse)
- GPS coordinates for maps
- Contact information
- Capacity tracking
- Manager assignment
- Badge colors for UI

**Employees**:
- Replace `job` string with `positionId` FK
- Replace `location` string with `workLocationId` FK
- Add `contractTypeId` FK (instead of `contract` string)

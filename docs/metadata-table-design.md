# Metadata Table Design

## Concept

Create a reusable metadata table pattern that tracks creation and modification times across all entities in the system. This provides:
- Audit trail for all records
- Consistent timestamp handling
- Easy extension for additional metadata (created_by, updated_by, etc.)

## Proposed Schema

### Option 1: Inline Metadata (Recommended)

Add timestamps directly to each table - simplest approach:

```typescript
// src/db/schema/positions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Metadata
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Position = typeof positions.$inferSelect
export type NewPosition = typeof positions.$inferInsert
```

### Option 2: Centralized Metadata Table

For more advanced tracking, create a dedicated metadata table:

```typescript
// src/db/schema/metadata.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const metadata = sqliteTable('metadata', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Entity reference
  entityType: text('entity_type').notNull(), // 'position', 'work_location', 'employee', etc.
  entityId: integer('entity_id').notNull(),  // ID of the referenced entity

  // Audit fields
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),

  // Optional: Who made the change (for future multi-user support)
  createdBy: integer('created_by'), // FK to users table
  updatedBy: integer('updated_by'), // FK to users table
})

// Unique constraint: one metadata record per entity
export const metadataUnique = sqliteTable('metadata_unique', {
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
})

// Create a view to easily query metadata with entities
export const metadataWithEntities = sqliteView('metadata_with_entities',
  /* SQL view definition */
)
```

**Example usage**:

```typescript
// Query positions with metadata
const positionWithMetadata = await db
  .select({
    position: positions,
    metadata: metadata,
  })
  .from(positions)
  .leftJoin(
    metadata,
    and(
      eq(metadata.entityType, 'position'),
      eq(metadata.entityId, positions.id)
    )
  )
```

### Option 3: Trigger-Based Automatic Updates (Hybrid Approach)

Keep timestamps in each table but use triggers to automatically update `updated_at`:

```typescript
// src/db/schema/positions.ts
export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Metadata (auto-managed by triggers)
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

**SQL Triggers** (in migration file):

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_positions_updated_at
AFTER UPDATE ON positions
BEGIN
  UPDATE positions SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Auto-update updated_at timestamp for work_locations
CREATE TRIGGER update_work_locations_updated_at
AFTER UPDATE ON work_locations
BEGIN
  UPDATE work_locations SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Similar triggers for all tables...
```

## Recommended Approach: Option 3 (Hybrid)

**Why Option 3?**
1. ✅ **Simple**: Timestamps in each table (easy to query)
2. ✅ **Automatic**: Triggers handle `updated_at` automatically
3. ✅ **Reliable**: No application code needed
4. ✅ **Performant**: No joins required
5. ✅ **Extensible**: Can add `createdBy`, `updatedBy` later

## Implementation

### 1. Schema with Timestamps

All tables follow the same pattern:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Common metadata columns pattern
const metadataColumns = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}

// Positions
export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  ...metadataColumns,
})

// Work Locations
export const workLocations = sqliteTable('work_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  ...metadataColumns,
})

// Employees
export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  positionId: integer('position_id').references(() => positions.id),
  workLocationId: integer('work_location_id').references(() => workLocations.id),
  status: text('status').notNull(),
  hireDate: text('hire_date').notNull(),
  ...metadataColumns,
})
```

### 2. Migration File Example

```typescript
// src/db/migrations/YYYYMMDDHHMMSS_add_timestamps.sql

-- Add timestamps to positions
ALTER TABLE positions ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE positions ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Add timestamps to work_locations
ALTER TABLE work_locations ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE work_locations ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Add timestamps to employees
ALTER TABLE employees ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE employees ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_positions_updated_at
AFTER UPDATE ON positions
BEGIN
  UPDATE positions SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER update_work_locations_updated_at
AFTER UPDATE ON work_locations
BEGIN
  UPDATE work_locations SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER update_employees_updated_at
AFTER UPDATE ON employees
BEGIN
  UPDATE employees SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
```

### 3. Helper Functions (Optional)

```typescript
// src/lib/utils/metadata.ts

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string, locale = 'fr-FR'): string {
  return new Date(timestamp).toLocaleString(locale)
}

/**
 * Calculate time ago for display
 */
export function timeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  return `Il y a ${diffDays} j`
}
```

## Extension Possibilities

The metadata pattern can be extended with:

### Phase 1: Current
- `created_at`
- `updated_at`

### Phase 2: User Tracking (Future)
- `created_by` (FK to users table)
- `updated_by` (FK to users table)

### Phase 3: Soft Delete (Future)
- `deleted_at` (nullable, soft delete support)

### Phase 4: Additional Audit (Future)
- `version` (for optimistic locking)
- `change_reason` (why was this changed?)

## Usage in Queries

### Query by Creation Date
```typescript
import { desc } from 'drizzle-orm'

// Get recently created positions
const recentPositions = await db
  .select()
  .from(positions)
  .orderBy(desc(positions.createdAt))
  .limit(10)
```

### Query by Update Date
```typescript
// Get recently modified positions
const recentlyModified = await db
  .select()
  .from(positions)
  .where(eq(positions.isActive, true))
  .orderBy(desc(positions.updatedAt))
  .limit(10)
```

### Filter by Date Range
```typescript
import { gte, lte } from 'drizzle-orm'

// Get positions created in date range
const startDate = '2024-01-01'
const endDate = '2024-12-31'

const positionsInRange = await db
  .select()
  .from(positions)
  .where(
    and(
      gte(positions.createdAt, startDate),
      lte(positions.createdAt, endDate)
    )
  )
```

## Summary

**Recommended**: Option 3 - Inline timestamps with auto-update triggers

**Benefits**:
- ✅ Simple and performant
- ✅ Automatic `updated_at` management
- ✅ No application code required
- ✅ Easy to extend later
- ✅ Works offline (no external dependencies)

**All tables** should have:
- `created_at` - Set on insert, never changes
- `updated_at` - Set on insert, auto-updates on row modification

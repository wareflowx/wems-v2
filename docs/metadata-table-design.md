# Metadata Table Design

## Concept

Create reusable column helpers that track creation and modification times across all entities in the system. This provides:
- Audit trail for all records
- Consistent timestamp handling
- DRY principle - define once, reuse everywhere
- Easy extension for additional metadata

## Drizzle ORM Column Helpers Pattern

### Define Timestamp Columns Once

```typescript
// src/db/schema/columns.helpers.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Reusable timestamp columns for all tables
 * Includes created_at, updated_at, and optional deleted_at for soft deletes
 */
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}

/**
 * Timestamp columns with soft delete support
 * Use this for tables that need soft delete functionality
 */
export const timestampsWithSoftDelete = {
  ...timestamps,
  deletedAt: text('deleted_at'), // Nullable, for soft deletes
}

/**
 * Timestamp columns with user tracking
 * Use this when you need to track who created/modified records
 */
export const timestampsWithUserTracking = {
  ...timestamps,
  createdBy: integer('created_by'), // FK to users table
  updatedBy: integer('updated_by'), // FK to users table
}
```

### Usage in Table Definitions

#### Positions Table

```typescript
// src/db/schema/positions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Reusable metadata columns
  ...timestamps,
})

export type Position = typeof positions.$inferSelect
export type NewPosition = typeof positions.$inferInsert
```

#### Work Locations Table

```typescript
// src/db/schema/work-locations.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'

export const workLocations = sqliteTable('work_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Reusable metadata columns
  ...timestamps,
})

export type WorkLocation = typeof workLocations.$inferSelect
export type NewWorkLocation = typeof workLocations.$inferInsert
```

#### Employees Table

```typescript
// src/db/schema/employees.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'
import { positions } from './positions'
import { workLocations } from './work-locations'

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  positionId: integer('position_id').references(() => positions.id),
  workLocationId: integer('work_location_id').references(() => workLocations.id),
  contractTypeId: integer('contract_type_id'),
  status: text('status').notNull(),
  hireDate: text('hire_date').notNull(),

  // Reusable metadata columns
  ...timestamps,
})

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
```

## Advanced Patterns

### Soft Delete Pattern

```typescript
// src/db/schema/columns.helpers.ts
export const timestampsWithSoftDelete = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'), // Nullable for soft deletes
}

// Usage
export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ... other fields
  ...timestampsWithSoftDelete,
})
```

### User Tracking Pattern

```typescript
// src/db/schema/columns.helpers.ts
export const timestampsWithUserTracking = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'), // FK to users.id
  updatedBy: integer('updated_by'), // FK to users.id
}

// Usage when multi-user support is needed
export const auditFields = {
  ...timestampsWithUserTracking,
  version: integer('version').notNull().default(1), // For optimistic locking
}
```

## Indexes for Performance

```typescript
// src/db/schema/positions.ts
import { timestamps } from './columns.helpers'

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  ...timestamps,
}, (table) => ({
  indexes: [
    { name: 'idx_positions_created_at', on: table.createdAt },
    { name: 'idx_positions_updated_at', on: table.updatedAt },
  ],
}))
```

## Complete Helper File

```typescript
// src/db/schema/columns.helpers.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Standard timestamp columns
 * Automatically set on create and update
 */
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}

/**
 * Timestamps with soft delete support
 * Use for tables that need soft delete functionality
 */
export const timestampsWithSoftDelete = {
  ...timestamps,
  deletedAt: text('deleted_at'), // Nullable, for soft deletes
}

/**
 * Timestamps with user tracking
 * Use when tracking who created/modified records
 */
export const timestampsWithUserTracking = {
  ...timestamps,
  createdBy: integer('created_by'), // FK: users.id
  updatedBy: integer('updated_by'), // FK: users.id
}

/**
 * Full audit trail (timestamps + users + soft delete + versioning)
 * Use for critical data that needs complete audit history
 */
export const auditFields = {
  ...timestampsWithUserTracking,
  deletedAt: text('deleted_at'), // Soft delete
  version: integer('version').notNull().default(1), // Optimistic locking
}

/**
 * Helper to add metadata indexes to a table
 * Call this in your table definition for optimal query performance
 */
export function withMetadataIndexes(table: any) {
  return {
    indexes: [
      { name: `idx_${table}_created_at`, on: table.createdAt },
      { name: `idx_${table}_updated_at`, on: table.updatedAt },
      table.deletedAt && { name: `idx_${table}_deleted_at`, on: table.deletedAt },
    ].filter(Boolean),
  }
}
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

## Benefits of Column Helpers Pattern

**Why this approach?**

1. **DRY Principle**: Define once, reuse everywhere
2. **Type Safety**: TypeScript infers types correctly
3. **Consistency**: All tables have exact same column definitions
4. **Maintainability**: Change in one place, updates all tables
5. **Flexibility**: Easy to create variants (timestamps, audit fields, etc.)
6. **Batteries Included**: Drizzle ORM natively supports this pattern

## Implementation Steps

### 1. Create Column Helpers File

```typescript
// src/db/schema/columns.helpers.ts
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}
```

### 2. Use in All Tables

```typescript
// Every table gets metadata automatically
export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps, // ← Reusable helper
})
```

### 3. Generate Migration

```bash
npm run db:generate
npm run db:migrate
```

### 4. Add SQL Triggers (Optional)

Auto-update `updated_at` on every UPDATE:

```sql
CREATE TRIGGER update_positions_updated_at
AFTER UPDATE ON positions
BEGIN
  UPDATE positions SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
```

## Usage Examples

### Query by Creation Date
```typescript
import { desc } from 'drizzle-orm'

const recentPositions = await db
  .select()
  .from(positions)
  .orderBy(desc(positions.createdAt))
  .limit(10)
```

### Query by Update Date
```typescript
const recentlyModified = await db
  .select()
  .from(positions)
  .where(eq(positions.isActive, true))
  .orderBy(desc(positions.updatedAt))
  .limit(10)
```

### Filter by Date Range
```typescript
import { gte, lte, and } from 'drizzle-orm'

const positionsInRange = await db
  .select()
  .from(positions)
  .where(
    and(
      gte(positions.createdAt, '2024-01-01'),
      lte(positions.createdAt, '2024-12-31')
    )
  )
```

### Soft Delete Query (if using timestampsWithSoftDelete)

```typescript
const activePositions = await db
  .select()
  .from(positions)
  .where(isNull(positions.deletedAt))
```

## Extension Phases

### Phase 1: Basic (Current)
```typescript
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}
```

### Phase 2: User Tracking (Future)
```typescript
export const timestampsWithUserTracking = {
  ...timestamps,
  createdBy: integer('created_by'), // FK: users.id
  updatedBy: integer('updated_by'), // FK: users.id
}
```

### Phase 3: Soft Delete (Future)
```typescript
export const timestampsWithSoftDelete = {
  ...timestamps,
  deletedAt: text('deleted_at'), // Nullable
}
```

### Phase 4: Full Audit (Future)
```typescript
export const auditFields = {
  ...timestampsWithUserTracking,
  deletedAt: text('deleted_at'),
  version: integer('version').notNull().default(1),
}
```

## Helper Utilities

```typescript
// src/lib/utils/metadata.ts

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('fr-FR')
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

## Summary

**Recommended**: Column helpers pattern

**Benefits**:
- ✅ DRY - define once, reuse everywhere
- ✅ Type safe - TypeScript infers correctly
- ✅ Consistent - same columns across all tables
- ✅ Maintainable - one place to update
- ✅ Flexible - easy variants (timestamps, audit, soft delete)
- ✅ Native - Drizzle ORM supports this pattern
- ✅ Batteries included - works with Drizzle Kit migrations

**All tables** should have:
- `createdAt` - Set on insert, never changes
- `updated_at` - Set on insert, can auto-update on UPDATE

**All tables** should have:
- `created_at` - Set on insert, never changes
- `updated_at` - Set on insert, auto-updates on row modification

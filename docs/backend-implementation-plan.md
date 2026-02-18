# Backend Implementation Plan

## Overview

Complete step-by-step plan to integrate a SQLite backend with Drizzle ORM, ORPC for RPC, and Electron IPC into the WEMS v2 application.

**Current State**:
- Frontend complete with TanStack Query + mock data
- Database connection configured (better-sqlite3 + Drizzle)
- ORPC installed but not configured
- API layer uses mock data

**Target State**:
- Full SQLite database with Drizzle ORM
- ORPC server with type-safe RPC
- Electron IPC for main/renderer communication
- All TanStack Query hooks connected to real data
- Data migrations from mock to database

---

## Implementation Phases

### Phase 0: Preparation & Configuration ⏱️ 30 min

**Goal**: Set up tooling and configuration

#### Steps:

1. **Configure Drizzle Kit**
   ```bash
   # Create drizzle.config.ts in project root
   # Point to src/db/schema
   # Use better-sqlite3 driver
   ```

2. **Create Schema Directory Structure**
   ```
   src/db/schema/
   ├── index.ts              # Exports all schemas
   ├── columns.helpers.ts    # Reusable timestamp helpers
   ├── employees.ts          # Employee table
   ├── positions.ts          # Job titles/positions
   ├── work-locations.ts     # Work locations
   ├── contract-types.ts     # Contract types (reference data)
   ├── departments.ts        # Departments (reference data)
   └── ...other tables
   ```

3. **Validate Environment**
   - Ensure better-sqlite3 is installed
   - Run `npm run rebuild` if needed
   - Verify Drizzle Kit CLI works

**Deliverables**:
- `drizzle.config.ts`
- Empty schema files with proper exports
- Validated development environment

---

### Phase 1: Database Schema ⏱️ 2 hours

**Goal**: Define all database tables with relationships

#### Tables to Create (In Order):

1. **Reference Tables** (no dependencies)
   - `departments`
   - `contract_types`
   - `positions`
   - `work_locations`

2. **Core Tables** (depend on reference tables)
   - `employees`
   - `contracts`

3. **Feature Tables**
   - `caces`
   - `medical_visits`
   - `documents`
   - `alerts`

#### Schema Definitions:

**Pattern for each table**:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { timestamps } from './columns.helpers'

export const tableName = sqliteTable('table_name', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ... business fields
  ...timestamps,
}, (table) => ({
  indexes: [
    { name: `idx_${singular}_id`, on: table.id },
    // ... other indexes
  ],
})
```

**Relationships**:
- `employees.positionId` → `positions.id`
- `employees.workLocationId` → `work_locations.id`
- `employees.contractTypeId` → `contract_types.id`

**Deliverables**:
- All schema files created
- Proper foreign key relationships
- Indexes defined
- TypeScript types inferred correctly

---

### Phase 2: Drizzle Migrations ⏱️ 1 hour

**Goal**: Generate and apply database migrations

#### Steps:

1. **Generate Initial Migration**
   ```bash
   npm run db:generate
   ```
   - Creates migration SQL files
   - Includes all tables, indexes, foreign keys

2. **Review Migration File**
   - Check generated SQL in `src/db/migrations/`
   - Verify all tables and indexes
   - Ensure foreign keys are correct

3. **Apply Migration**
   ```bash
   npm run db:push
   ```
   - Creates database file
   - Runs all migrations
   - Sets up schema

4. **Verify Database**
   ```bash
   npm run db:studio
   ```
   - Open Drizzle Studio
   - Verify tables created
   - Check relationships in UI

**Deliverables**:
- Migration files generated
- Database schema created
- All tables verified in Drizzle Studio

---

### Phase 3: Database Utilities ⏱️ 1 hour

**Goal**: Create helper functions for database operations

#### Files to Create:

1. **Database Client Singleton**
   ```typescript
   // src/db/client.ts
   import { drizzle } from 'drizzle-orm/better-sqlite3'
   import * as schema from './schema'

   let db: ReturnType<typeof drizzle> | null = null

   export function getDb() {
     if (!db) {
       const Database = module.require('better-sqlite3')
       const sqlite = new Database(getDbPath())
       db = drizzle({ client: sqlite, schema })
     }
     return db
   }
   ```

2. **Seed Data Functions** (optional, for testing)
   - `seedReferenceData()` - departments, contract types, positions
   - `seedWorkLocations()` - work locations
   - `seedEmployees()` - sample employees

3. **Helper Functions**
   - Format timestamp utilities
   - Query builders for common patterns

**Deliverables**:
- Database client singleton
- Seed data functions
- Utility functions

---

### Phase 4: ORPC Server Setup ⏱️ 2 hours

**Goal**: Create type-safe RPC server routes

#### Architecture:

```
┌─────────────────────────────┐
│  Main Process (Electron)      │
│  ┌───────────────────────────┐ │
│  │ ORPC Server              │ │
│  │  ├─ employees router     │ │
│  │  ├─ positions router     │ │
│  │  ├─ work_locations router │ │
│  │  └─ ...                   │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ IPC Handler               │ │
│  └───────────────────────────┘ │
└─────────────────────────────┘
          ↓ IPC
┌─────────────────────────────┐
│  Renderer Process           │
│  ┌───────────────────────────┐ │
│  │ ORPC Client              │ │
│  │  ├─ employees.getAll()    │ │
│  │  ├─ employees.getById()   │ │
│  │  └─ ...                   │ │
│  └───────────────────────────┘ │
└─────────────────────────────┘
```

#### Files to Create:

1. **Server Router**
   ```typescript
   // src/server/rpc/index.ts
   import { ORPC } from '@orpc/server'

   export const appRouter = new ORPC()
     .router('employees', employeesRouter)
     .router('positions', positionsRouter)
     .router('workLocations', workLocationsRouter)
     // ... other routers

   export type AppRouter = typeof appRouter
   ```

2. **Individual Routers**
   ```typescript
   // src/server/rpc/employees.ts
   import { db } from '@/db'
   import { employees, type NewEmployee } from '@/db/schema'
   import { eq, and } from 'drizzle-orm'

   export const employeesRouter = {
     // Query procedures
     getAll: async ({ filters }: { filters?: EmployeeFilters }) => {
       return await db.select().from(employees).where(...)
     },

     getById: async ({ id }: { id: number }) => {
       const [employee] = await db.select().from(employees)
         .where(eq(employees.id, id))
       return employee
     },

     // Mutation procedures
     create: async (input: NewEmployee) => {
       const [employee] = await db.insert(employees)
         .values(input)
         .returning()
       return employee
     },

     update: async ({ id, updates }: { id: number, updates: Partial<NewEmployee> }) => {
       const [employee] = await db.update(employees)
         .set(updates)
         .where(eq(employees.id, id))
         .returning()
       return employee
     },

     delete: async ({ id }: { id: number }) => {
       await db.delete(employees).where(eq(employees.id, id))
     },
   }
   ```

3. **Type Definitions**
   - Input Zod schemas for validation
   - Filter types for queries
   - Response types

**Deliverables**:
- ORPC server router created
- All CRUD procedures implemented
- Type-safe procedures with Zod validation

---

### Phase 5: Electron IPC Integration ⏱️ 2 hours

**Goal**: Connect main process ORPC server to renderer process

#### Architecture:

```
Main Process:
  ORPC Server → IPC Handler → Expose routes

Renderer Process:
  ORPC Client → IPC Invoke → Call server routes
```

#### Files to Create:

1. **Main Process IPC Handler**
   ```typescript
   // src/main.ts (main process)
   import { ipcMain } from 'electron'
   import { createTRPCContext } from '@orpc/server/electron'
   import { appRouter } from './server/rpc'

   const tRPC = createTRPCContext()

   ipcMain.handle('rpc', async (event, route, input) => {
     // Route format: "employees.getById"
     const [router, procedure] = route.split('.')
     return await appRouter[router][procedure](input)
   })
   ```

2. **Preload Script**
   ```typescript
   // src/preload.ts
   import { ipcRenderer } from 'electron'

   export const api = {
     rpc: async <T>(route: string, input?: any): Promise<T> => {
       return await ipcRenderer.invoke('rpc', route, input)
     }
   }

   export type ElectronAPI = typeof api
   ```

3. **Type Expose**
   ```typescript
   // src/preload.ts
   exposeInMainWorld('api', api)
   ```

4. **Window Type Declaration**
   ```typescript
   // src/types/electron.d.ts
   interface Window {
     api: {
       rpc: <T>(route: string, input?: any) => Promise<T>
     }
   }
   ```

**Deliverables**:
- IPC handler configured in main process
   Preload script exposes RPC client
   TypeScript types defined
   End-to-end type safety

---

### Phase 6: ORPC Client Setup ⏱️ 1 hour

**Goal**: Create type-safe client for renderer process

#### Files to Create:

1. **ORPC Client**
   ```typescript
   // src/client/rpc.ts
   import { createORPC } from '@orpc/client'
   import type { AppRouter } from '@/server/rpc'

   export const rpc = createORPC<AppRouter>({
     path: async (route, input) => {
       return await window.api.rpc(route, input)
     },
   })
   ```

2. **API Layer Update**
   ```typescript
   // src/api/employees.ts
   import { rpc } from '@/client/rpc'

   export const employeesApi = {
     getAll: async (filters?: EmployeeFilters) => {
       return await rpc.employees.getAll({ filters })
     },
     // ... other methods
   }
   ```

**Deliverables**:
- ORPC client created
- All API files updated to use RPC
- Mock data removed from API layer

---

### Phase 7: Update TanStack Query Hooks ⏱️ 2 hours

**Goal**: Connect React Query hooks to real RPC calls

#### Files to Update:

1. **Hook Files**
   ```typescript
   // src/hooks/use-employees.ts
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
   import { employeesApi } from '@/api/employees'
   import { queryKeys } from '@/lib/query-keys'

   export function useEmployees(filters?: EmployeeFilters) {
     return useQuery({
       queryKey: queryKeys.employees.list(JSON.stringify(filters)),
       queryFn: () => employeesApi.getAll(filters),
     })
   }

   export function useCreateEmployee() {
     const queryClient = useQueryClient()

     return useMutation({
       mutationFn: employeesApi.create,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
       },
     })
   }
   ```

2. **Query Keys**
   ```typescript
   // src/lib/query-keys.ts
   export const queryKeys = {
     employees: {
       lists: () => ['employees'] as const,
       list: (filters: string) => ['employees', 'list', filters] as const,
       detail: (id: number) => ['employees', 'detail', id] as const,
     },
     // ... other entities
   }
   ```

**Deliverables**:
- All hooks updated to use RPC
- Query keys standardized
- Optimistic updates implemented
- Mock data removed

---

### Phase 8: Data Migration ⏱️ 1 hour

**Goal**: Migrate existing mock data to database

#### Steps:

1. **Create Seed Script**
   ```typescript
   // src/db/seed.ts
   import { db } from './client'
   import * as schema from './schema'

   export async function seedDatabase() {
     await db.transaction(async (tx) => {
       // Insert departments
       await tx.insert(schema.departments).values([
         { name: 'Production' },
         { name: 'Administration' },
         { name: 'RH' },
         { name: 'Commercial' },
       ])

       // Insert contract types
       await tx.insert(schema.contractTypes).values([
         { name: 'CDI' },
         { name: 'CDD' },
         { name: 'Intérim' },
         { name: 'Alternance' },
       ])

       // Insert positions
       await tx.insert(schema.positions).values([
         { code: 'OPERATOR', name: 'Opérateur', isActive: true },
         { code: 'TECHNICIAN', name: 'Technicien', isActive: true },
         // ...
       ])

       // Insert work locations
       await tx.insert(schema.workLocations).values([
         { code: 'SITE_PARIS', name: 'Site Paris', isActive: true },
         { code: 'SITE_LYON', name: 'Site Lyon', isActive: true },
         // ...
       ])

       // Insert employees with FKs
       await tx.insert(schema.employees).values([
         {
           firstName: 'Jean',
           lastName: 'Dupont',
           email: 'jean.dupont@email.com',
           phone: '06 12 34 56 78',
           positionId: 2, // Technicien
           workLocationId: 1, // Site Paris
           contractTypeId: 1, // CDI
           status: 'active',
           hireDate: '2020-03-15',
         },
         // ...
       ])
     })
   }
   ```

2. **Run Seed**
   - Create utility command to run seed
   - Execute seed after migrations

**Deliverables**:
- Seed script created
- All mock data migrated to database
- Reference data populated
- Sample employees created with relationships

---

### Phase 9: UI Component Updates ⏱️ 3 hours

**Goal**: Update UI to work with real data

#### Changes Needed:

1. **Remove Mock Data Imports**
   - Delete `src/mock-data/` usage
   - Update any components directly importing mocks

2. **Update Forms**
   - Ensure forms submit correct data structure
   - Add FK selection instead of text inputs
   - Update validation schemas

3. **Update Tables**
   - Ensure columns display correct data
   - Add FK lookups for display names
   - Handle loading/error states properly

4. **Add Error Handling**
   - Display user-friendly error messages
   - Add retry mechanisms
   - Handle network failures gracefully

**Deliverables**:
- All UI components updated
- Forms working with real data
- Proper error handling
- Loading states working

---

### Phase 10: Testing & Validation ⏱️ 2 hours

**Goal**: Test entire system end-to-end

#### Test Cases:

1. **Database Tests**
   - CRUD operations work correctly
   - Foreign keys enforce constraints
   - Indexes improve query performance
   - Triggers update timestamps

2. **RPC Tests**
   - IPC communication works
   - Type safety maintained
   - Validation works

3. **Integration Tests**
   - Create employee flow works
   - Update employee flow works
   - Delete employee flow works
   - Filters work correctly

4. **Manual Testing**
   - Start application
   - Create new employee
   - Edit existing employee
   - Delete employee
   - Verify data persists

**Deliverables**:
- All tests passing
- Manual testing checklist complete
- Bug fixes applied
- System working end-to-end

---

### Phase 11: Documentation & Cleanup ⏱️ 1 hour

**Goal**: Document the implementation and clean up

#### Tasks:

1. **Update Documentation**
   - Update architecture diagrams
   - Document API procedures
   - Create developer guide

2. **Code Cleanup**
   - Remove unused mock data files
   - Clean up temporary code
   - Add code comments

3. **Performance Optimization**
   - Add database indexes where needed
   - Optimize queries
   - Add caching where appropriate

**Deliverables**:
- Documentation updated
- Code cleaned up
- Performance optimized
- Ready for production

---

## Implementation Order Summary

### Critical Path:

```
1. Schema Definition → 2. Migrations → 3. Database Client
                                              ↓
4. ORPC Server → 5. IPC Setup → 6. ORPC Client
                                              ↓
                  7. Update Hooks → 8. Data Migration
                                              ↓
                  9. UI Updates → 10. Testing → 11. Documentation
```

### Parallel Opportunities:

- **Phase 1-3**: Database (can work in parallel with RPC setup)
- **Phase 9-10**: UI updates (can work incrementally)

### Estimated Timeline:

- **Total**: 15-16 hours
- **Critical Path**: 12 hours
- **Parallel work possible**: 3-4 hours saved

---

## Success Criteria

### Must Have:

✅ All tables created with proper relationships
✅ Migrations generated and applied
✅ ORPC server handles all CRUD operations
✅ IPC communication working
✅ All hooks connected to real data
✅ UI forms working with database
✅ Data persists across application restarts

### Should Have:

✅ Error handling throughout
✅ Loading states in UI
✅ Optimistic updates working
✅ Type safety maintained
✅ Basic performance optimization

### Nice to Have:

✅ Comprehensive error messages
✅ Data validation on all inputs
✅ Database query optimization
✅ Caching strategies
✅ Audit trail functionality

---

## Rollback Plan

If implementation fails at any phase:

1. **Before Migration Phase**: No impact, mock data still works
2. **Before IPC Phase**: Database ready, can test with SQL directly
3. **Before Client Phase**: Server ready, can use Postman/curl for testing
4. **Before Hooks Phase**: RPC ready, mock data still functional in UI
5. **Before Migration Phase**: All code ready, safe to switch

**Rollback Strategy**:
- Keep mock data until RPC client confirmed working
- Use feature flags to enable/disable backend per module
- Test in development branch before merging to main

---

## Dependencies & Blockers

### External Dependencies:
- better-sqlite3 (native module, may need rebuild)
- Drizzle Kit (CLI tools)
- Electron IPC

### Potential Blockers:
- Native module compilation issues
- IPC serialization complexity
- Type safety maintenance
- Performance optimization needs

### Mitigation:
- Test in clean environment first
- Use proper TypeScript throughout
- Start with simple implementations
- Profile and optimize as needed

---

## Next Steps

**When ready to begin**, start with:

1. ✅ Review and approve this plan
2. ✅ Create feature branch from `feature/backend-integration`
3. ✅ Begin Phase 0: Preparation & Configuration
4. ✅ Follow phases sequentially
5. ✅ Test thoroughly at each phase

**Ready to implement when you are!**

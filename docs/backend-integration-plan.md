# Backend Integration Plan

## Architecture Actuelle

Le projet est une application Electron avec les couches suivantes :

```
┌─────────────────────────────────────────┐
│  UI Components (React + shadcn/ui)      │
├─────────────────────────────────────────┤
│  Hooks (TanStack Query)                 │  ← src/hooks/use-*.ts
├─────────────────────────────────────────┤
│  API Layer (Mock)                        │  ← src/api/*.ts
├─────────────────────────────────────────┤
│  Mock Data                               │  ← src/mock-data/*.ts
└─────────────────────────────────────────┘
```

## Technologie Déjà Installée

✅ **Base de données** :
- `drizzle-orm` v0.45.1
- `better-sqlite3` v12.6.2
- `drizzle-kit` v0.31.9
- `@libsql/client` v0.17.0

✅ **RPC Framework** :
- `@orpc/server` v1.13.4
- `@orpc/client` v1.13.4

✅ **State Management** :
- `@tanstack/react-query` v5.90.21 (déjà configuré)

✅ **Scripts de migration** :
```json
"db:generate": "drizzle-kit generate"
"db:migrate": "drizzle-kit migrate"
"db:studio": "drizzle-kit studio"
"db:push": "drizzle-kit push"
```

## Étapes d'Intégration

### 1. Définir les Schémas Drizzle

Créer les tables dans `src/db/schema/` :

```
src/db/schema/
├── index.ts
├── employees.ts
├── caces.ts
├── documents.ts
├── medical-visits.ts
├── contracts.ts
├── alerts.ts
├── reference.ts
└── settings.ts
```

**Exemple de schéma** :

```typescript
// src/db/schema/employees.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  contractType: text('contract_type').notNull(),
  jobTitle: text('job_title').notNull(),
  department: text('department').notNull(),
  workLocation: text('work_location').notNull(),
  status: text('status').notNull(), // 'active' | 'on_leave' | 'terminated'
  hireDate: text('hire_date').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
```

### 2. Configurer Drizzle Kit

Créer `drizzle.config.ts` à la racine :

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema',
  out: './src/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './dev-db.sqlite',
  },
} satisfies Config
```

### 3. Générer les Migrations

```bash
npm run db:generate  # Génère les migrations
npm run db:migrate   # Applique les migrations
npm run db:studio    # UI pour voir la BDD
```

### 4. Créer le Serveur RPC avec @orpc

**Architecture RPC** :

```typescript
// src/server/rpc/employees.ts
import { employees, type NewEmployee } from '@/db/schema'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const employeeRouter = {
  // Récupérer tous les employés
  getAll: async (input?: { filters?: EmployeeFilters }) => {
    return await db.select().from(employees)
  },

  // Récupérer un employé par ID
  getById: async (input: { id: number }) => {
    const [employee] = await db.select().from(employees)
      .where(eq(employees.id, input.id))
    return employee
  },

  // Créer un employé
  create: async (input: NewEmployee) => {
    const [employee] = await db.insert(employees)
      .values(input)
      .returning()
    return employee
  },

  // Mettre à jour un employé
  update: async (input: { id: number, updates: Partial<Employee> }) => {
    const [employee] = await db.update(employees)
      .set(input.updates)
      .where(eq(employees.id, input.id))
      .returning()
    return employee
  },

  // Supprimer un employé
  delete: async (input: { id: number }) => {
    await db.delete(employees).where(eq(employees.id, input.id))
  },
}
```

**Router principal** :

```typescript
// src/server/rpc/index.ts
import { ORPC } from '@orpc/server'
import { employeeRouter } from './employees'
import { cacesRouter } from './caces'
import { documentsRouter } from './documents'
// ...

export const appRouter = new ORPC()
  .router('employees', employeeRouter)
  .router('caces', cacesRouter)
  .router('documents', documentsRouter)
  // ...

export type AppRouter = typeof appRouter
```

### 5. Exposer les Routes IPC (Electron)

**Main Process** :

```typescript
// src/main.ts (main process)
import { ipcMain } from 'electron'
import { appRouter } from './server/rpc'

ipcMain.handle('rpc', async (event, route, input) => {
  // Route: 'employees.getAll'
  // Input: { filters: {...} }

  const [router, procedure] = route.split('.')
  const result = await appRouter[router][procedure](input)
  return result
})
```

**Preload Script** :

```typescript
// src/preload.ts
import { ipcRenderer } from 'electron'

export const api = {
  rpc: async <T>(route: string, input?: any): Promise<T> => {
    return await ipcRenderer.invoke('rpc', route, input)
  },
}

export type ElectronAPI = typeof api
```

### 6. Créer le Client ORPC

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

### 7. Mettre à jour l'API Layer

```typescript
// src/api/employees.ts
import { rpc } from '@/client/rpc'

export const employeesApi = {
  getAll: async (filters?: EmployeeFilters) => {
    return await rpc.employees.getAll({ filters })
  },

  getById: async (id: number) => {
    return await rpc.employees.getById({ id })
  },

  create: async (input: CreateEmployeeInput) => {
    return await rpc.employees.create(input)
  },

  update: async (input: UpdateEmployeeInput) => {
    return await rpc.employees.update(input)
  },

  delete: async (id: number) => {
    return await rpc.employees.delete({ id })
  },
}
```

## Avantages de cette Architecture

1. **Type Safety** : Types TypeScript de bout en bout
2. **RPC** : Appels de procédure distante, pas de HTTP manuel
3. **Electron IPC** : Communication native processus
4. **Drizzle** : ORM moderne avec TypeScript
5. **TanStack Query** : Cache et synchronisation automatique

## Ordre de Migration

1. ✅ Définir tous les schémas Drizzle
2. ✅ Générer et appliquer les migrations
3. ✅ Créer les routers RPC
4. ✅ Configurer IPC dans Electron
5. ✅ Créer le client RPC
6. ✅ Mettre à jour l'API layer
7. ✅ Tester et migrer les données mock
8. ✅ Supprimer les mocks

## Next Steps

Voulez-vous que je commence par créer les schémas de base de données ?

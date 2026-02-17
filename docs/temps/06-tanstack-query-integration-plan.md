# TanStack Query Integration Plan for WEMS Application

## Executive Summary

This document outlines a comprehensive strategy for integrating TanStack Query (React Query) into the WEMS (Workforce Employee Management System) application while maintaining dummy data. The goal is to improve data management, caching, and user experience through modern state management practices.

**Current State**: 54 data entities across 9 pages using useState for data management
**Target State**: Centralized API layer with TanStack Query for server state management

**Estimated Migration Time**: 12-17 days
**Complexity**: Medium-High
**Priority**: High

---

## Table of Contents

1. [Current Application Analysis](#current-application-analysis)
2. [Proposed Architecture](#proposed-architecture)
3. [Query Keys Strategy](#query-keys-strategy)
4. [API Layer Design](#api-layer-design)
5. [Custom Hooks Implementation](#custom-hooks-implementation)
6. [Page Migration Examples](#page-migration-examples)
7. [Reusable Hooks](#reusable-hooks)
8. [Migration Strategy](#migration-strategy)
9. [Benefits & Challenges](#benefits--challenges)

---

## Current Application Analysis

### Pages with Mock Data

| Page | Entity Count | CRUD Operations | Filtering | Sorting | Pagination |
|------|--------------|-----------------|-----------|---------|------------|
| Dashboard | 5 alerts | Read only | ✅ | ❌ | ❌ |
| Employees | 5 employees | Create, Delete | ✅ | ❌ | ✅ (10 items) |
| Contracts | 6 contracts | TODOs only | ✅ | ❌ | ✅ (10 items) |
| Documents | 4 documents | Create, Delete | ✅ | ✅ | ✅ (10 items) |
| CACES | 5 certifications | Create, Edit | ✅ | ✅ | ✅ (10 items) |
| Medical Visits | 4 visits | Create, Delete | ✅ | ✅ | ✅ (10 items) |
| Alerts | 7 alerts | Read only | ✅ | ✅ | ✅ (10 items) |
| Settings/Reference | 14 items | Create, Edit, Delete | ❌ | ❌ | ❌ |
| Settings/Backup | 2 backups | TODOs only | ❌ | ❌ | ❌ |
| Settings/System | Config values | Update only | ❌ | ❌ | ❌ |

**Total: 54 data entities across 9 pages**

### Common Patterns Identified

#### 1. Filtering Pattern (7 pages)
```typescript
const filteredData = useMemo(() => {
  return data.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.field.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' || item.field === filter
    return matchesSearch && matchesFilter
  })
}, [data, search, filter])
```

**Used in**: Dashboard, Employees, Contracts, Documents, CACES, Medical Visits, Alerts

#### 2. Sorting Pattern (4 pages)
```typescript
const sortedData = useMemo(() => {
  const sorted = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}, [filteredData, sortColumn, sortDirection])
```

**Used in**: Documents, CACES, Medical Visits, Alerts

#### 3. Pagination Pattern (7 pages)
```typescript
const totalPages = Math.ceil(sortedData.length / itemsPerPage)
const paginatedData = sortedData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)
```

**Used in**: Employees, Contracts, Documents, CACES, Medical Visits, Alerts

#### 4. KPI Calculation Pattern (6 pages)
```typescript
const kpis = {
  total: data.length,
  filtered: data.filter(item => item.status === 'active').length,
  // ... more metrics
}
```

**Used in**: Dashboard, Employees, Contracts, Documents, CACES, Medical Visits, Alerts

#### 5. Dialog Management Pattern
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<Item | null>(null)

const handleDelete = (item: Item) => {
  setSelectedItem(item)
  setIsDialogOpen(true)
}
```

**Used in**: Employees, Documents, CACES, Medical Visits, Settings

---

## Proposed Architecture

### Folder Structure

```
src/
├── lib/
│   ├── api/                        # API layer with dummy data
│   │   ├── index.ts               # Centralized exports
│   │   ├── employees.ts           # Employees API
│   │   ├── contracts.ts           # Contracts API
│   │   ├── documents.ts           # Documents API
│   │   ├── caces.ts              # CACES API
│   │   ├── medical-visits.ts     # Medical visits API
│   │   ├── alerts.ts             # Alerts API
│   │   └── reference.ts          # Reference data API
│   ├── hooks/                     # Custom TanStack Query hooks
│   │   ├── index.ts              # Centralized exports
│   │   ├── use-employees.ts
│   │   ├── use-contracts.ts
│   │   ├── use-documents.ts
│   │   ├── use-caces.ts
│   │   ├── use-medical-visits.ts
│   │   ├── use-alerts.ts
│   │   └── use-reference-data.ts
│   ├── query-keys.ts             # Centralized query keys
│   ├── query-client.ts           # QueryClient configuration
│   └── utils.ts                  # Existing utilities
└── mock-data/                     # Centralized dummy data
    ├── employees.ts
    ├── contracts.ts
    ├── documents.ts
    ├── caces.ts
    ├── medical-visits.ts
    ├── alerts.ts
    └── reference.ts
```

---

## Query Keys Strategy

Centralized query keys enable efficient cache management and invalidation.

### File: `src/lib/query-keys.ts`

```typescript
// Hierarchical query keys for cache management
export const queryKeys = {
  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => ['employees', 'list'] as const,
    list: (filters: string) => ['employees', 'list', filters] as const,
    details: () => ['employees', 'detail'] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
  },

  // Contracts
  contracts: {
    all: ['contracts'] as const,
    lists: () => ['contracts', 'list'] as const,
    list: (filters: string) => ['contracts', 'list', filters] as const,
    details: () => ['contracts', 'detail'] as const,
    detail: (id: number) => ['contracts', 'detail', id] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => ['documents', 'list'] as const,
    list: (filters: string) => ['documents', 'list', filters] as const,
    details: () => ['documents', 'detail'] as const,
    detail: (id: number) => ['documents', 'detail', id] as const,
  },

  // CACES Certifications
  caces: {
    all: ['caces'] as const,
    lists: () => ['caces', 'list'] as const,
    list: (filters: string) => ['caces', 'list', filters] as const,
    details: () => ['caces', 'detail'] as const,
    detail: (id: number) => ['caces', 'detail', id] as const,
  },

  // Medical Visits
  medicalVisits: {
    all: ['medical-visits'] as const,
    lists: () => ['medical-visits', 'list'] as const,
    list: (filters: string) => ['medical-visits', 'list', filters] as const,
    details: () => ['medical-visits', 'detail'] as const,
    detail: (id: number) => ['medical-visits', 'detail', id] as const,
  },

  // Alerts
  alerts: {
    all: ['alerts'] as const,
    lists: () => ['alerts', 'list'] as const,
    list: (filters: string) => ['alerts', 'list', filters] as const,
  },

  // Reference Data (Settings)
  reference: {
    all: ['reference'] as const,
    departments: () => ['reference', 'departments'] as const,
    jobTitles: () => ['reference', 'job-titles'] as const,
    contractTypes: () => ['reference', 'contract-types'] as const,
  },
} as const
```

### Benefits of This Structure

1. **Type-safe**: All keys are fully typed with `as const`
2. **Hierarchical**: Easy to invalidate entire subtrees
3. **Predictable**: Consistent naming across entities
4. **Invalidation**: Simple to target specific cache entries

```typescript
// Invalidate all employee queries
queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })

// Invalidate only employee lists
queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })

// Invalidate specific employee
queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) })
```

---

## API Layer Design

### QueryClient Configuration

**File: `src/lib/query-client.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30,    // 30 minutes - cache retention
      retry: 1,                  // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false,     // Don't refetch on component mount if data exists
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### Integration in Application

**File: `src/main.tsx`**

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/query-client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {process.env.NODE_ENV === 'development' && (
      <ReactQueryDevtools initialIsOpen={false} />
    )}
  </QueryClientProvider>
)
```

### Example: Employees API

**File: `src/lib/api/employees.ts`**

```typescript
import { employees as mockEmployees } from '@/mock-data/employees'

// Types
export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  contract: string
  job: string
  department: string
  location: string
  status: string
  hireDate: string
}

export interface EmployeeFilters {
  search?: string
  department?: string
  status?: string
}

export interface CreateEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  contract: string
  job: string
  department: string
  location: string
  status: string
  hireDate: string
}

export interface UpdateEmployeeInput {
  id: number
  updates: Partial<Employee>
}

// API functions simulating server calls
export const employeesApi = {
  // READ - Get all employees with optional filters
  getAll: async (filters?: EmployeeFilters): Promise<Employee[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...mockEmployees]

    // Server-side filtering
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(emp =>
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.department && filters.department !== 'all') {
      data = data.filter(emp => emp.department === filters.department)
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter(emp => emp.status === filters.status)
    }

    return data
  },

  // READ - Get employee by ID
  getById: async (id: number): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const employee = mockEmployees.find(emp => emp.id === id)
    if (!employee) {
      throw new Error(`Employee with id ${id} not found`)
    }
    return employee
  },

  // CREATE - Add new employee
  create: async (input: CreateEmployeeInput): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newEmployee: Employee = {
      id: Math.max(...mockEmployees.map(e => e.id), 0) + 1,
      ...input,
    }

    mockEmployees.push(newEmployee)
    return newEmployee
  },

  // UPDATE - Modify existing employee
  update: async ({ id, updates }: UpdateEmployeeInput): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = mockEmployees.findIndex(emp => emp.id === id)
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`)
    }

    mockEmployees[index] = { ...mockEmployees[index], ...updates }
    return mockEmployees[index]
  },

  // DELETE - Remove employee
  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockEmployees.findIndex(emp => emp.id === id)
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`)
    }

    mockEmployees.splice(index, 1)
  },
}
```

---

## Custom Hooks Implementation

### Employees Hook

**File: `src/lib/hooks/use-employees.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi, type EmployeeFilters, type CreateEmployeeInput, type UpdateEmployeeInput } from '@/lib/api/employees'
import { queryKeys } from '@/lib/query-keys'

// Hook for fetching employees list
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(JSON.stringify(filters)),
    queryFn: () => employeesApi.getAll(filters),
  })
}

// Hook for fetching single employee
export function useEmployee(id: number) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id, // Only run query if id exists
  })
}

// Hook for creating employee with optimistic update
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.create(input),

    // Optimistic update
    onMutate: async (newEmployee) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      // Save previous data
      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => [
          ...old,
          { ...newEmployee, id: Date.now() }
        ]
      )

      return { previousEmployees }
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeesApi.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.details() })
    },
  })
}

// Hook for deleting employee with optimistic update
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => old.filter(emp => emp.id !== id)
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}
```

---

## Page Migration Examples

### Example 1: Employees Page Migration

#### Before (Current Code)

```typescript
export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null)

  // Mock data in component
  const employees = [
    { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', ... },
    { id: 2, firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@email.com', ... },
    // ... more employees
  ]

  // Client-side filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        search === '' ||
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase())

      const matchesDepartment =
        departmentFilter === 'all' ||
        emp.department === departmentFilter

      const matchesStatus =
        statusFilter === 'all' ||
        emp.status === statusFilter

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [employees, search, departmentFilter, statusFilter])

  // Client-side pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = () => {
    console.log('Deleting employee:', { id: employeeToDelete?.id })
    // TODO: Implement backend logic
  }

  return (
    <div>
      {/* Table with paginatedEmployees */}
      <Button onClick={() => setIsCreateDialogOpen(true)}>Add Employee</Button>
    </div>
  )
}
```

#### After (With TanStack Query)

```typescript
export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  // Use custom hook with filters
  const {
    data: employees = [],
    isLoading,
    error
  } = useEmployees({
    search,
    department: departmentFilter,
    status: statusFilter,
  })

  // Mutations
  const deleteEmployee = useDeleteEmployee()
  const createEmployee = useCreateEmployee()

  // Pagination (can be moved to custom hook)
  const itemsPerPage = 10
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setEmployeeToDelete(null)
        }
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading employees</div>
  }

  return (
    <div>
      {/* Table with paginatedEmployees */}
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        Add Employee
      </Button>
    </div>
  )
}
```

### Example 2: Documents Page Migration

#### Before

```typescript
const [deletingDocument, setDeletingDocument] = useState<any>(null)

const handleSubmit = () => {
  // TODO: Implement backend logic
  console.log('Deleting document:', { id: deletingDocument?.id })
  onConfirm?.()
  onOpenChange?.(false)
}
```

#### After

```typescript
const deleteDocument = useDeleteDocument()

const handleSubmit = () => {
  if (deletingDocument) {
    deleteDocument.mutate(deletingDocument.id, {
      onSuccess: () => {
        onOpenChange?.(false)
        setDeletingDocument(null)
      }
    })
  }
}
```

### Example 3: Settings Reference Data Migration

#### Before

```typescript
const [departments, setDepartments] = useState([
  "Production",
  "Administration",
  "RH",
  "Commercial",
  "Maintenance",
])

const confirmDelete = () => {
  const { index } = deleteDialog
  if (index >= 0) {
    setDepartments(departments.filter((_, i) => i !== index))
  }
  setDeleteDialog({ ...deleteDialog, open: false })
}
```

#### After

```typescript
const { data: departments = [] } = useDepartments()
const deleteDepartment = useDeleteDepartment()

const confirmDelete = () => {
  const { value } = deleteDialog
  deleteDepartment.mutate(value, {
    onSuccess: () => {
      setDeleteDialog({ ...deleteDialog, open: false })
    }
  })
}
```

---

## Reusable Hooks

### useTableData Hook

**File: `src/lib/hooks/use-table-data.ts`**

```typescript
import { useState, useMemo } from 'react'

interface UseTableDataOptions<T> {
  items: T[]
  itemsPerPage?: number
  searchableFields?: (keyof T)[]
}

interface UseTableDataReturn<T> {
  // State
  search: string
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  currentPage: number
  totalPages: number

  // Data
  items: T[]
  filteredItems: T[]

  // Actions
  setSearch: (search: string) => void
  handleSort: (column: string) => void
  setCurrentPage: (page: number) => void
}

export function useTableData<T>({
  items,
  itemsPerPage = 10,
  searchableFields = [],
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Search
    if (search && searchableFields.length > 0) {
      const searchLower = search.toLowerCase()
      result = result.filter(item =>
        searchableFields.some(field =>
          String(item[field]).toLowerCase().includes(searchLower)
        )
      )
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn as keyof T]
        const bValue = b[sortColumn as keyof T]
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [items, search, sortColumn, sortDirection, searchableFields])

  // Paginate
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  return {
    // State
    search,
    sortColumn,
    sortDirection,
    currentPage,
    totalPages,

    // Data
    items: paginatedItems,
    filteredItems,

    // Actions
    setSearch,
    handleSort,
    setCurrentPage,
  }
}
```

#### Usage Example

```typescript
export function EmployeesPage() {
  const { data: employees = [] } = useEmployees()

  const {
    items,
    search,
    setSearch,
    sortColumn,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useTableData({
    items: employees,
    itemsPerPage: 10,
    searchableFields: ['firstName', 'lastName', 'email'],
  })

  return (
    <div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} />
      <Table>
        {items.map(employee => (
          <TableRow key={employee.id}>
            {/* Render employee */}
          </TableRow>
        ))}
      </Table>
    </div>
  )
}
```

---

## Migration Strategy

### Phase 1: Foundation (Day 1)

**Tasks:**
1. Install dependencies:
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

2. Create folder structure:
   - `src/lib/api/`
   - `src/lib/hooks/`
   - `src/mock-data/`

3. Setup QueryClient:
   - Create `src/lib/query-client.ts`
   - Create `src/lib/query-keys.ts`
   - Add QueryClientProvider to `main.tsx`

**Deliverables:**
- ✅ QueryClient configured and integrated
- ✅ Query keys structure defined
- ✅ Folder structure created

---

### Phase 2: API Layer (Days 2-4)

**Tasks:**

**Day 2: Core Entities**
- Create `src/lib/api/employees.ts`
- Create `src/lib/api/contracts.ts`
- Create `src/lib/api/documents.ts`
- Move mock data to `src/mock-data/`

**Day 3: Certification & Health**
- Create `src/lib/api/caces.ts`
- Create `src/lib/api/medical-visits.ts`
- Create `src/lib/api/alerts.ts`

**Day 4: Settings**
- Create `src/lib/api/reference.ts`
- Create `src/lib/api/settings.ts`
- Export all from `src/lib/api/index.ts`

**Deliverables:**
- ✅ All API functions with simulated delays
- ✅ Type definitions for each entity
- ✅ Centralized mock data files

---

### Phase 3: Custom Hooks (Days 5-7)

**Tasks:**

**Day 5: Entity Hooks**
- Create `use-employees.ts` (query + mutations)
- Create `use-contracts.ts` (query + mutations)
- Create `use-documents.ts` (query + mutations)

**Day 6: Certification & Health Hooks**
- Create `use-caces.ts` (query + mutations)
- Create `use-medical-visits.ts` (query + mutations)
- Create `use-alerts.ts` (query only)

**Day 7: Settings Hooks**
- Create `use-reference-data.ts` (query + mutations)
- Create `use-table-data.ts` (reusable table hook)
- Export all from `src/lib/hooks/index.ts`

**Deliverables:**
- ✅ All data fetching hooks
- ✅ All mutation hooks with optimistic updates
- ✅ Reusable useTableData hook

---

### Phase 4: Page Migration (Days 8-14)

**Order of Migration (Simplest to Most Complex):**

**Day 8: Settings Pages**
- Migrate `settings/alerts-page.tsx`
- Migrate `settings/system-page.tsx`
- Migrate `settings/backup-page.tsx`

**Day 9: Settings Reference**
- Migrate `settings/reference-page.tsx`

**Day 10: Alerts Page**
- Migrate `alerts-page.tsx`

**Day 11: Dashboard**
- Migrate `home-page.tsx`

**Day 12: Documents**
- Migrate `documents-page.tsx`
- Update `AddDocumentDialog.tsx`
- Update `DeleteDocumentDialog.tsx`

**Day 13: Medical Visits**
- Migrate `medical-visits-page.tsx`
- Update `AddMedicalVisitDialog.tsx`
- Update `DeleteMedicalVisitDialog.tsx`

**Day 14: CACES**
- Migrate `caces-page.tsx`
- Update `AddCacesDialog.tsx`
- Update `EditCacesDialog.tsx`

**Deliverables:**
- ✅ All pages using TanStack Query hooks
- ✅ Dialogs connected to mutations
- ✅ Loading and error states implemented

---

### Phase 5: Complex Pages (Days 15-17)

**Tasks:**

**Day 15: Contracts**
- Migrate `contracts-page.tsx`
- Create contract dialogs if needed

**Day 16: Employees (Part 1)**
- Migrate `employees-page.tsx`
- Update `CreateEmployeeDialog.tsx`

**Day 17: Employees (Part 2)**
- Update `DeleteEmployeeDialog.tsx`
- Final testing and bug fixes

**Deliverables:**
- ✅ All complex pages migrated
- ✅ All CRUD operations functional
- ✅ Optimistic updates working

---

### Phase 6: Cleanup (Day 18+)

**Tasks:**
1. Remove old useState patterns for data
2. Add loading skeletons
3. Improve error boundaries
4. Add comprehensive error messages
5. Update tests
6. Write documentation

**Deliverables:**
- ✅ Clean codebase
- ✅ Enhanced UX
- ✅ Updated documentation

---

## Benefits & Challenges

### ✅ Benefits

#### Technical Benefits

1. **Separation of Concerns**
   - Data fetching logic separated from UI
   - Easier to test and maintain
   - Clear ownership of responsibilities

2. **Automatic Caching**
   - Intelligent cache management
   - Reduced API calls (even with dummy data)
   - Configurable freshness thresholds

3. **Loading & Error States**
   - Built-in `isLoading`, `isError` states
   - Automatic retry logic
   - Consistent error handling

4. **Optimistic Updates**
   - Instant UI feedback
   - Automatic rollback on error
   - Better user experience

5. **Code Reusability**
   - Shared hooks across pages
   - Consistent patterns
   - Reduced boilerplate

6. **Type Safety**
   - Better TypeScript inference
   - Compile-time validation
   - Fewer runtime errors

7. **Developer Experience**
   - React Query DevTools
   - Visual cache inspector
   - Easier debugging

8. **Backend Readiness**
   - Architecture ready for real API
   - Easy to swap dummy data for fetch calls
   - Minimal refactoring needed

#### UX Benefits

1. **Instant Feedback**
   - Optimistic updates feel instantaneous
   - No waiting for "server" response
   - Smooth interactions

2. **Robust Error Handling**
   - Automatic retry with backoff
   - User-friendly error messages
   - Graceful degradation

3. **Data Freshness**
   - Configurable refetch intervals
   - Stale-time management
   - Manual refresh capabilities

4. **Offline Resilience**
   - Cached data available offline
   - Background refetching
   - Better perceived performance

### ⚠️ Challenges

#### Technical Challenges

1. **Initial Complexity**
   - More files and structure
   - New concepts to learn
   - Setup overhead

2. **Bundle Size**
   - Adds ~13KB gzipped
   - May impact initial load
   - Consider code-splitting

3. **Boilerplate Code**
   - Need to create API layer
   - Need to define hooks
   - Need to manage query keys

4. **Learning Curve**
   - Team must learn TanStack Query
   - Understanding of cache mechanics
   - Mutation patterns

#### Migration Challenges

1. **Incremental Migration**
   - Can't migrate everything at once
   - Old and new code coexist temporarily
   - Potential for inconsistencies

2. **State Synchronization**
   - Migrating page by page
   - Some pages still using useState
   - Cache invalidation complexity

3. **Testing Updates**
   - All existing tests need updates
   - Mock queries instead of useState
   - New testing patterns required

4. **Documentation**
   - Need to document new patterns
   - Team training required
   - Code review guidelines

---

## Code Examples by Feature

### 1. Data Fetching with Filters

```typescript
// Hook
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(JSON.stringify(filters)),
    queryFn: () => employeesApi.getAll(filters),
  })
}

// Usage
const { data: employees = [], isLoading } = useEmployees({
  search,
  department: departmentFilter,
  status: statusFilter,
})
```

### 2. Creating Data with Optimistic Update

```typescript
// Hook
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.create(input),

    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => [...old, { ...newEmployee, id: Date.now() }]
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Usage
const createEmployee = useCreateEmployee()

const handleSubmit = (data: EmployeeFormData) => {
  createEmployee.mutate(data, {
    onSuccess: () => {
      toast.success('Employee created successfully')
      setIsDialogOpen(false)
    },
    onError: (error) => {
      toast.error('Failed to create employee')
    }
  })
}
```

### 3. Deleting Data

```typescript
// Hook
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => old.filter(emp => emp.id !== id)
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Usage
const deleteEmployee = useDeleteEmployee()

const handleDelete = (id: number) => {
  deleteEmployee.mutate(id, {
    onSuccess: () => {
      toast.success('Employee deleted')
      setIsDeleteDialogOpen(false)
    }
  })
}
```

### 4. Editing Data

```typescript
// Hook
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeesApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => old.map(emp =>
          emp.id === id ? { ...emp, ...updates } : emp
        )
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.details() })
    },
  })
}

// Usage
const updateEmployee = useUpdateEmployee()

const handleEdit = (id: number, data: EmployeeFormData) => {
  updateEmployee.mutate({ id, updates: data }, {
    onSuccess: () => {
      toast.success('Employee updated')
      setIsEditDialogOpen(false)
    }
  })
}
```

---

## Testing Strategy

### Unit Testing with TanStack Query

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEmployees } from '@/lib/hooks/use-employees'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('useEmployees', () => {
  it('should fetch employees successfully', async () => {
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useEmployees(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(5)
    expect(result.current.error).toBeNull()
  })
})
```

---

## Performance Considerations

### 1. Stale Time Configuration

```typescript
// Different entities can have different stale times
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // Global error handler
      console.error('Query error:', error)
    },
  }),
})
```

### 2. Selective Refetching

```typescript
// Only refetch when needed
const { data } = useEmployees()
const queryClient = useQueryClient()

const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
}
```

### 3. Prefetching

```typescript
// Prefetch data for better UX
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.employees.lists(),
    queryFn: () => employeesApi.getAll(),
  })
}, [])
```

---

## Conclusion

### Summary

Integrating TanStack Query into the WEMS application will significantly improve data management, user experience, and code maintainability. The migration should be approached incrementally, starting with simpler pages and progressing to more complex ones.

### Key Takeaways

1. **Start Small**: Begin with settings pages to establish patterns
2. **Use Custom Hooks**: Create reusable hooks for common operations
3. **Optimistic Updates**: Implement for better UX
4. **Type Safety**: Leverage TypeScript throughout
5. **Document Everything**: Clear documentation for team onboarding

### Next Steps

1. Review and approve this migration plan
2. Set up development environment with TanStack Query
3. Begin Phase 1 (Foundation)
4. Create detailed task tickets for each phase
5. Schedule regular progress reviews

### Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/devtools)
- [Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)

---

**Document Version**: 1.0
**Last Updated**: 2025-02-16
**Author**: WEMS Development Team

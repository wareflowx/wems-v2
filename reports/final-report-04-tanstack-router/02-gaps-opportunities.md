# Gaps & Improvement Opportunities

This document outlines the identified gaps between the current WEMS v2 routing implementation and TanStack Router best practices.

---

## Gaps Table

| Area | Current State | Best Practice | Priority |
|------|---------------|---------------|----------|
| **Search Params** | Manual state management in components | Use built-in `validateSearch` with Zod schemas | **HIGH** |
| **Authentication Guards** | None implemented | Implement `beforeLoad` hook for protected routes | MEDIUM |
| **Route Loaders** | Data fetched in components via TanStack Query | Use route loaders for centralized loading | MEDIUM |
| **Nested Routes** | Flat structure (20 routes as siblings) | Group related routes with layout components | MEDIUM |
| **Lazy Loading** | None | Add `lazy()` function for code splitting | LOW |
| **Prefetching** | Not used | Implement on hover/focus for faster navigation | LOW |

---

## Detailed Gap Analysis

### 1. Search Params (HIGH Priority Gap)

**Current State:**
- Filter state managed with `useState` in components
- State is local to each component instance
- URL does not reflect filter state
- Page refresh loses filter context

**Best Practice:**
```typescript
export const Route = createFileRoute("/agencies")({
  validateSearch: (search) => {
    return z.object({
      q: z.string().optional().default(""),
      status: z.enum(["all", "active", "inactive"]).default("all"),
      page: z.coerce.number().int().positive().default(1),
    }).parse(search);
  },
  component: AgenciesPage,
});
```

**Why This Matters:**
- Shareable URLs for filtered views
- Browser back/forward works correctly
- Filter state survives page refresh
- Type-safe with Zod validation

---

### 2. Authentication Guards (MEDIUM Priority Gap)

**Current State:**
- No route-level authentication checks
- Permission checks happen inside components with `useEffect`

**Best Practice:**
```typescript
const protectedRoute = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.canWrite) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: AdminPage,
});
```

**Why This Matters:**
- Centralized auth logic
- Earlier failure (before component renders)
- Cleaner component code

---

### 3. Route Loaders (MEDIUM Priority Gap)

**Current State:**
- Data fetching via TanStack Query hooks in components
- No route-level data loading

**Best Practice:**
```typescript
export const Route = createFileRoute("/employees")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: queryKeys.employees.all,
      queryFn: () => db.getEmployees(),
    });
  },
  component: EmployeesPage,
});
```

**Why This Matters:**
- Centralizes initial data loading
- Better for SSR scenarios
- Can prefetch data before navigation completes

---

### 4. Nested Routes (MEDIUM Priority Gap)

**Current State:**
- 20 routes all flat under root
- No shared layouts for related pages

**Best Practice:**
```
src/routes/
  _reference-data/
    positions.tsx
    departments.tsx
    work-locations.tsx
    _reference-data-layout.tsx  # Shared layout
```

**Why This Matters:**
- Shared header/breadcrumbs for related pages
- Easier to add group-level features
- Cleaner route tree organization

---

### 5. Lazy Loading (LOW Priority Gap)

**Current State:**
- All routes bundled together
- No code splitting

**Best Practice:**
```typescript
const Route = createFileRoute("/trash")({
  component: lazy(() => import("@/pages/trash-page")),
});
```

**Why This Matters:**
- Smaller initial bundle size
- Faster initial page load
- Routes loaded on demand

---

### 6. Prefetching (LOW Priority Gap)

**Current State:**
- No prefetching configured
- Data loads after navigation

**Best Practice:**
```typescript
<Link to="/employees" preload="intent">
  Employees
</Link>
```

**Why This Matters:**
- Faster perceived navigation
- Data ready before user clicks

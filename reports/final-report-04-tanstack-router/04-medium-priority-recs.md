# Medium Priority Recommendations

These recommendations provide meaningful improvements but require more implementation effort and planning.

---

## 3. Route Groups for Reference Data

**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated Effort:** 6-10 hours including testing

### What Are Route Groups

Route groups allow organizing related routes under a shared layout without affecting the URL structure. In TanStack Router, routes starting with underscore (`_`) are grouped but not reflected in the path.

### Proposed Structure

```
src/routes/
  _reference-data/
    positions.tsx
    departments.tsx
    work-locations.tsx
    contract-types.tsx
    _reference-data-layout.tsx  # Shared layout for reference data
  _employees/
    employees.tsx
    employees.$employeeId.tsx
    _employee-layout.tsx        # Shared layout for employee section
```

### Benefits

1. **Shared Header/Breadcrumbs**
   - Common navigation for related pages
   - Consistent page headers
   - Unified action buttons

2. **Group-Level Features**
   - Add tabs for switching between related views
   - Shared filters at the group level
   - Common context providers

3. **Cleaner Route Tree**
   - Logical grouping in code
   - Easier to understand relationships
   - Better file organization

### Implementation Example

```typescript
// src/routes/_reference-data/_reference-data-layout.tsx
import { Outlet } from "@tanstack/react-router";

export function ReferenceDataLayout() {
  return (
    <div className="reference-data-section">
      <header>
        <h1>Reference Data</h1>
        <nav>
          <Link to="/positions">Positions</Link>
          <Link to="/departments">Departments</Link>
          <Link to="/work-locations">Work Locations</Link>
          <Link to="/contract-types">Contract Types</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
```

### Migration Path

1. Create new layout files with underscore prefix
2. Move existing route files into group folders
3. Add shared layout component
4. Test that URLs remain unchanged
5. Remove old file locations

---

## 4. Selective Route Loaders

**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated Effort:** 4-8 hours for key pages

### Important Context

In WEMS's Electron context without SSR, TanStack Query is already the appropriate choice for data fetching. Loaders are an optional enhancement for initial page loads, not a replacement for TanStack Query.

### When to Use Loaders

- Initial page load data (before paint)
- Pre-populating TanStack Query cache
- Server-side rendering scenarios
- Critical data needed immediately

### Recommended Approach

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/employees")({
  loader: async ({ context }) => {
    // Pre-populate cache so useQuery doesn't fetch
    await context.queryClient.ensureQueryData({
      queryKey: queryKeys.employees.all,
      queryFn: () => db.getEmployees(),
    });
  },
  component: EmployeesPage,
});
```

### Loader vs Component Data Fetching

| Aspect | Loaders | TanStack Query in Component |
|--------|---------|----------------------------|
| Timing | Before navigation completes | After component renders |
| SSR | First-class support | Requires client detection |
| Caching | Manual | Automatic with stale-while-revalidate |
| Deduplication | Manual | Automatic |
| Retry logic | Manual | Automatic |

### Recommendation

Use loaders selectively for:
- Initial page load optimization
- Preloading critical data
- Maintaining loader pattern for potential SSR future

Do not replace TanStack Query hooks with loaders - they serve different purposes.

---

## 5. beforeLoad Hooks for Route Guards

**Priority:** MEDIUM
**Complexity:** MEDIUM
**Estimated Effort:** 3-5 hours

### Current Pattern (In Component)

```typescript
const [canWrite, setCanWrite] = useState(true);

useEffect(() => {
  window.getWriteMode?.().then(setCanWrite);
}, []);

// Then conditionally render UI
{canWrite && <EditButton />}
```

### Problems with Current Approach

1. Component renders before permission check
2. Permission check happens client-side only
3. Logic scattered across components
4. Hard to protect multiple routes

### Recommended Pattern

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

### Benefits

1. **Earlier Failure** - Redirect happens before component renders
2. **Centralized Logic** - Auth logic in one place per route
3. **Type-safe Redirects** - Compiler validates redirect targets
4. **Testability** - Easy to mock context for testing

### BeforeLoad Context

The `beforeLoad` hook receives context from the router:

```typescript
declare module "@tanstack/react-router" {
  registerRoute({
    beforeLoad: ({ context }) => {
      return {
        auth: {
          canRead: boolean;
          canWrite: boolean;
          user: User | null;
        };
      };
    },
  });
}
```

### Protected Route Example

```typescript
// src/routes/_admin/admin.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthFromMain } from "@/lib/auth";

export const Route = createFileRoute("/_admin/admin")({
  beforeLoad: async ({ location }) => {
    const auth = await getAuthFromMain();

    if (!auth.canAccessAdmin) {
      throw redirect({
        to: "/unauthorized",
        search: { returnTo: location.href },
      });
    }
  },
  component: AdminPage,
});
```

---

## Summary of Medium Priority Items

| Recommendation | Benefit | Effort | Risk |
|----------------|---------|--------|------|
| Route Groups | Code organization | 6-10 hrs | MEDIUM |
| Selective Loaders | Initial load perf | 4-8 hrs | LOW |
| beforeLoad Guards | Security | 3-5 hrs | MEDIUM |

All three can be implemented incrementally without disrupting existing functionality.

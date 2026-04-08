# Low Priority Recommendations

These recommendations offer incremental improvements but are not critical to the application's core functionality.

---

## 6. Lazy Loading

**Priority:** LOW
**Complexity:** LOW
**Estimated Effort:** 1-2 hours

### When to Use Lazy Loading

Lazy loading is beneficial for routes that:
- Are rarely accessed
- Have heavy dependencies (PDF generation, large libraries)
- Are not needed for initial render
- Should be deferred to reduce bundle size

### Recommended Routes for Lazy Loading

| Route | Reason |
|-------|--------|
| `/trash` | Rarely accessed, trash contents |
| `/exports` | Heavy PDF/Excel generation libraries |
| `/posts` | Blog-like functionality, not core workflow |

### Implementation

```typescript
import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Option 1: Inline lazy with factory function
const Route = createFileRoute("/trash")({
  component: lazy(() => import("@/pages/trash-page")),
});

// Option 2: Named import with dynamic import
const Route = createFileRoute("/exports")({
  component: lazy(() =>
    import("@/pages/exports-page").then((m) => ({
      default: m.ExportsPage,
    }))
  ),
});
```

### Benefits

1. **Smaller Initial Bundle**
   - First paint faster
   - Less JavaScript parsed initially

2. **On-Demand Loading**
   - Routes load when navigated to
   - Memory freed when navigating away

3. **Parallel Development**
   - Teams can work on routes independently
   - Clear lazy boundaries

### Loading State

Remember to handle loading states:

```typescript
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

---

## 7. Prefetching

**Priority:** LOW
**Complexity:** LOW
**Estimated Effort:** 1 hour

### What Is Prefetching

Prefetching loads route data before the user actually navigates to that route. When the user clicks, the page renders immediately with data already available.

### TanStack Router Prefetching

```typescript
<Link to="/employees" preload="intent">
  Employees
</Link>
```

### Preload Options

| Option | Trigger |
|--------|---------|
| `preload="intent"` | Mouse hover or touch focus |
| `preload="render"` | When link renders in viewport |
| `preload={true}` | Always prefetch |

### Implementation Example

```typescript
// Navigation with prefetching
<Link to="/employees" preload="intent">
  <UsersIcon /> Employees
</Link>

// For conditional prefetching
<Link
  to="/reports"
  preload={shouldPrefetch ? "intent" : false}
>
  Reports
</Link>
```

### TanStack Query Integration

Prefetching works seamlessly with TanStack Query:

```typescript
<Link
  to="/employees"
  preload="intent"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.employees.all,
      queryFn: () => db.getEmployees(),
    });
  }}
>
  Employees
</Link>
```

### Benefits

1. **Faster Perceived Navigation**
   - Data ready before user clicks
   - Eliminates loading spinners on navigation

2. **Better UX**
   - Smoother experience
   - Feels instant

3. **Non-Blocking**
   - Uses idle browser time
   - Does not impact current page performance

### Caveats

- Only prefetch when confident user will navigate
- Be careful with data that changes frequently (use staleTime)
- Do not prefetch large datasets unnecessarily

---

## Summary

| Recommendation | Benefit | Effort | Complexity |
|----------------|---------|--------|------------|
| Lazy Loading | Smaller bundle | 1-2 hrs | LOW |
| Prefetching | Faster navigation | 1 hr | LOW |

Both are optional enhancements that can be added when:
- Bundle size becomes a concern
- Performance profiling shows need
- After core features are stable

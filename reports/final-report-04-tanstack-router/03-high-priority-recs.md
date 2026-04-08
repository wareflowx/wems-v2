# High Priority Recommendations

These recommendations should be implemented first as they provide immediate user value with relatively low implementation complexity.

---

## 1. Search Param Schemas

**Priority:** HIGH
**Complexity:** LOW
**Estimated Effort:** 2-3 hours per major filterable page

### Why This Matters

Industry consensus favors URL-persisted filter state for:
- Shareability of filtered views
- Browser history integration
- Type safety with Zod validation
- Reduced React re-renders from state updates

### Current Pattern (PROBLEMATIC)

```typescript
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

// Filtering happens in memory, state is local to component
const filteredAgencies = useFilteredData(agencies, {
  search,
  filters: { isActive: statusFilter === "active" ? true : ... }
});
```

### Recommended Pattern

```typescript
// src/routes/agencies.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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

### Updated Component Usage

```typescript
// In AgenciesPage - useSearch instead of useState
import { useSearch, useNavigate } from "@tanstack/react-router";

export function AgenciesPage() {
  const { q, status, page } = useSearch({ from: "/agencies" });
  const navigate = useNavigate({ from: "/agencies" });

  // Use q, status, page for filtering
  // Update URL: navigate({ search: { q: "new search", status, page } })

  // URL becomes: /agencies?q=searchterm&status=active&page=2
}
```

### Benefits

- Filter state survives page refresh
- Shareable URLs for filtered views
- Browser back/forward works correctly
- Type-safe search params with Zod validation
- Reduces React re-renders from state updates

---

## 2. Configure DevTools

**Priority:** HIGH (but Trivial)
**Complexity:** TRIVIAL
**Estimated Effort:** 10 minutes

### Current State

The TanStack Router DevTools package is installed but not configured.

### Implementation

```typescript
// src/renderer/src/utils/routes.ts
import { devtools } from "@tanstack/react-router-devtools";

export const router = createRouter({
  defaultPendingMs: 0,
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

devtools(router); // Add this line
```

### Benefits

- Visual route tree inspection
- Search param debugging
- Navigation timing insights
- Zero runtime cost in production

### Note

This is a trivial configuration that provides significant debugging benefits with essentially zero risk.

---

## Implementation Strategy for Search Params

### Step 1: Identify Filterable Pages

Start with the most commonly used filterable pages:
1. `/agencies` - Agency list (status filter, search)
2. `/employees` - Employee list (department filter, status)
3. `/documents` - Document list (type filter, date range)

### Step 2: Define Zod Schemas

Create a shared schema file for each module:

```typescript
// src/routes/agencies.agencies-search-schema.ts
import { z } from "zod";

export const agenciesSearchSchema = z.object({
  q: z.string().optional().default(""),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
});

export type AgenciesSearch = z.infer<typeof agenciesSearchSchema>;
```

### Step 3: Update Route Configuration

```typescript
export const Route = createFileRoute("/agencies")({
  validateSearch: agenciesSearchSchema.parse,
  component: AgenciesPage,
});
```

### Step 4: Update Components

Replace `useState` with `useSearch` hook:
- Replace filter state reads with `useSearch()`
- Replace `setState` calls with `navigate({ search: {...} })`

### Step 5: Test

- Verify URL updates correctly
- Verify browser back/forward works
- Verify shareable URLs work
- Verify page refresh preserves state

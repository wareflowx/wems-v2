# CRITICAL Issue 2: Eager Query Loading - 7 ORPC Queries on Startup

## Location

- `src/renderer/src/components/app-sidebar.tsx:91-95`
- `src/renderer/src/pages/home-page.tsx:14-16`

## Problem Description

Seven ORPC queries fire immediately on mount before the UI renders, causing significant blocking during startup.

### Query Sources

```typescript
// app-sidebar.tsx:91-95 - 5 queries fire immediately
const { data: alerts = [] } = useAlerts();
const { data: caces = [] } = useCaces();
const { data: medicalVisits = [] } = useMedicalVisits();
const { data: drivingAuthorizations = [] } = useDrivingAuthorizations();
const { data: onlineTrainings = [] } = useOnlineTrainings();

// home-page.tsx:14-16 - 2 additional queries
const { data: allAlerts = [] } = useAlerts({});
const { data: employees = [] } = useEmployees();
```

### Each ORPC Query Involves

1. Message serialization
2. IPC round-trip to main process
3. Database query via better-sqlite3
4. Message serialization back
5. State update and re-render

## Optimization Solutions

### Option 1: Remove Sidebar Badge Queries (BEST)

These badge counts are NOT needed for first render. Remove them entirely.

### Option 2: Use staleTime to Prevent Refetches

```typescript
const { data: alerts = [] } = useAlerts({
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

### Option 3: QueryClient Defaults

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
```

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Blocking queries | 7 | 0-2 |
| Time savings | - | 4-10 seconds |

## Effort

- **1 hour** to remove sidebar badge queries
- **1 hour** to add staleTime to remaining queries
- **2 hours** to implement Suspense boundaries

---

*Part of WEMS v2 Startup Performance Analysis*

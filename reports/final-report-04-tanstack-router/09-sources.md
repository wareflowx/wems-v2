# Sources and References

This document contains the sources and references used in this TanStack Router analysis.

---

## Primary Sources

### TanStack Router Official Documentation

- **URL:** https://tanstack.com/router/latest
- **Topics Used:**
  - File-based routing setup
  - validateSearch with Zod
  - Route loaders
  - beforeLoad hooks
  - Lazy loading
  - Code generation (routeTree.gen.ts)

### TanStack Router GitHub Repository

- **URL:** https://github.com/TanStack/router
- **Topics Used:**
  - Type definitions
  - Best practices
  - Example implementations

---

## Key TanStack Router Features Analyzed

### 1. validateSearch

**Documentation:** https://tanstack.com/router/latest/guide/search-params

Zod-based search param validation built into TanStack Router.

```typescript
validateSearch: (search) => {
  return z.object({
    q: z.string().optional(),
    page: z.coerce.number(),
  }).parse(search);
}
```

### 2. Route Loaders

**Documentation:** https://tanstack.com/router/latest/guide/data-loading

Centralized data loading before component render.

```typescript
loader: async ({ context }) => {
  await context.queryClient.ensureQueryData({...});
}
```

### 3. beforeLoad Hook

**Documentation:** https://tanstack.com/router/latest/guide/route-guards

Authentication and authorization guards.

```typescript
beforeLoad: ({ context }) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({ to: "/login" });
  }
}
```

### 4. Route Groups

**Documentation:** https://tanstack.com/router/latest/guide/file-route-groups

Organizing routes with layouts without affecting URL structure.

Note: Route groups use underscore prefix (`_group-name/`) to indicate grouping without affecting the URL path.

### 5. Lazy Loading

**Documentation:** https://tanstack.com/router/latest/guide/lazy-loading

Code splitting with React.lazy integration.

```typescript
component: lazy(() => import("./pages/Trash"))
```

### 6. DevTools

**Package:** `@tanstack/react-router-devtools`

Browser DevTools extension for route visualization and debugging.

---

## Alternative Router Comparison

### React Router v7 Documentation

- **URL:** https://reactrouter.com/
- **Topics Compared:**
  - Type safety
  - Bundle size
  - Data loading patterns
  - SSR support

---

## Industry Best Practices

### URL State Management

References for URL-persisted filter state:
- Shareable URLs for filtered views
- Browser history integration
- Accessibility considerations

### Authentication Patterns

- Route guards vs component-level auth checks
- Centralized vs distributed auth logic
- Redirect patterns

---

## WEMS v2 Internal Context

### Related Files

- `/src/routes/__root.tsx` - Root route configuration
- `/src/routeTree.gen.ts` - Auto-generated route tree
- `/src/renderer/src/utils/routes.ts` - Router initialization
- `/src/lib/query-keys.ts` - Query key definitions

### Existing Patterns

- TanStack Query integration established
- TypeScript strict mode enabled
- Electron context with contextBridge

---

## Report Metadata

**Analysis Performed:** 2026-04-07

**Analysis Team:**
- Primary Analysis: Claude Sonnet 4.6
- Senior Review: Principal Software Architect

**Version History:**
- v1.0 - Merged Analysis + Senior Review - FINAL

---

## Additional Reading

### TypeScript Integration

- TanStack Router provides 100% TypeScript inference
- No code generation required for type safety
- Route params automatically inferred from file names

### Performance Considerations

- Bundle size impact of routing library
- Lazy loading benefits for rarely-used routes
- Prefetching strategies for improved UX

### Security Considerations

- Route guards for protected resources
- Server-side validation vs client-side
- Authorization patterns

# Implementation Roadmap

## Phase 1: Critical Fixes (Week 1)

**Objective:** Make delete and edit operations functional

1. Implement backend DELETE mutations for: Employees, Documents, Medical Visits
2. Implement backend UPDATE mutation for: Medical Visits
3. Wire dialog components to mutations following `use-agencies.ts` pattern
4. Add optimistic updates with rollback

**Estimated Duration:** 1-2 weeks

---

## Phase 2: Security Hardening (Week 2)

1. Add DOMPurify to chart component OR validate color input
2. Fix postMessage wildcard origins (`"*"` -> `window.location.origin`)
3. Add path validation for shell operations

**Estimated Duration:** 1 week

---

## Phase 3: Type Safety (Weeks 3-4)

1. Enable `strict: true` in tsconfig
2. Create interfaces for all database operations
3. Replace error handling from `any` to `unknown`
4. Add ESLint rules: `@typescript-eslint/no-explicit-any`

**Estimated Duration:** 2-3 weeks

---

## Phase 4: Error Resilience (Weeks 4-5)

1. Create centralized ErrorBoundary component
2. Add error boundary at app root
3. Per-route error boundaries

**Estimated Duration:** 1 week

---

## Phase 5: Code Quality (Week 6+)

1. Remove console.log statements or implement proper logging
2. Resolve all TODO comments
3. Extract magic numbers to constants

**Estimated Duration:** 2+ weeks

---

## Estimated Effort Summary

| Phase | Duration |
|-------|----------|
| Phase 1 (Critical) | 1-2 weeks |
| Phase 2 (Security) | 1 week |
| Phase 3 (Type Safety) | 2-3 weeks |
| Phase 4 (Error Boundaries) | 1 week |
| Phase 5 (Code Quality) | 2+ weeks |
| **Total** | **7-10 weeks** |

---

## Priority Order

1. **Week 1:** Phase 1 (Critical) - Delete and edit functionality
2. **Week 2:** Phase 2 (Security) - postMessage, path validation
3. **Weeks 3-4:** Phase 3 (Type Safety) - Strict TypeScript
4. **Weeks 4-5:** Phase 4 (Error Boundaries) - React Error Boundaries
5. **Week 6+:** Phase 5 (Code Quality) - Console.log, TODOs, magic numbers
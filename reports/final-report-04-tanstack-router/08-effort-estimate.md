# Effort Estimates

This document provides detailed effort estimates for each TanStack Router recommendation.

---

## Summary Table

| Recommendation | Complexity | Effort | Risk |
|----------------|------------|--------|------|
| Search Param Schemas | LOW | 2-3 hrs/page | LOW |
| DevTools Setup | TRIVIAL | 10 min | NONE |
| Route Groups | MEDIUM | 6-10 hrs total | MEDIUM |
| Selective Loaders | MEDIUM | 4-8 hrs | LOW |
| beforeLoad Guards | MEDIUM | 3-5 hrs | MEDIUM |
| Lazy Loading | LOW | 1-2 hrs | LOW |
| Prefetching | LOW | 1 hr | LOW |

**Total Estimated Effort:** 20-30 hours for comprehensive implementation

---

## Detailed Estimates

### 1. Search Param Schemas

**Complexity:** LOW
**Effort per page:** 2-3 hours

**Breakdown:**
- Define Zod schema: 30 min
- Update route configuration: 15 min
- Update component to use useSearch: 1 hr
- Update navigation calls: 30 min
- Testing and refinement: 1 hr

**Pages to implement (estimated):**
- `/agencies`: 2 hours
- `/employees`: 3 hours (more filters)
- `/documents`: 2.5 hours
- `/contracts`: 2 hours
- `/medical-visits`: 2 hours

**Total for all filterable pages:** ~15-20 hours

**Risk:** LOW
- Additive changes
- Fallback to defaults if schema invalid
- Easy to rollback

---

### 2. DevTools Setup

**Complexity:** TRIVIAL
**Effort:** 10 minutes

**Breakdown:**
- Add import statement: 2 min
- Add devtools() call: 3 min
- Verify in browser: 5 min

**Risk:** NONE
- Purely additive
- No existing code changes
- Disabled in production by default

---

### 3. Route Groups

**Complexity:** MEDIUM
**Effort:** 6-10 hours total

**Breakdown per group:**
- Create folder structure: 15 min
- Create layout component: 1 hr
- Move routes to group: 30 min per route
- Test navigation: 30 min
- Fix any issues: 1 hr

**Groups to create:**
- `_reference-data/` (4 routes): 3-4 hours
- `_employees/` (2 routes): 2 hours
- `_documents/` (2 routes): 2 hours

**Total:** 7-8 hours

**Risk:** MEDIUM
- File moves can cause import issues
- URL changes must be avoided (use underscore prefix)
- Test thoroughly before deploying

---

### 4. Selective Route Loaders

**Complexity:** MEDIUM
**Effort:** 4-8 hours for key pages

**Breakdown per page:**
- Define loader function: 30 min
- Integrate with queryClient: 30 min
- Handle loading states: 30 min
- Test cache hits: 1 hr

**Pages to add loaders:**
- `/agencies`: 1.5 hours
- `/employees`: 2 hours
- `/documents`: 1.5 hours
- `/alerts`: 1 hour
- `/positions`: 1 hour

**Total:** 7-8 hours

**Risk:** LOW
- Uses existing TanStack Query patterns
- ensureQueryData prevents duplicate fetches
- Falls back to network if cache miss

---

### 5. beforeLoad Guards

**Complexity:** MEDIUM
**Effort:** 3-5 hours

**Breakdown:**
- Define route context type: 1 hr
- Implement beforeLoad for one route: 1 hr
- Create unauthorized page: 30 min
- Add auth integration: 1 hr
- Test edge cases: 1 hr

**Risk:** MEDIUM
- Can lock out users if misconfigured
- Requires auth system integration
- Test with both auth states

---

### 6. Lazy Loading

**Complexity:** LOW
**Effort:** 1-2 hours

**Breakdown:**
- Identify routes to lazy load: 15 min
- Implement lazy() wrapper: 15 min per route
- Add Suspense boundary: 15 min
- Test loading states: 30 min

**Routes to lazy load:**
- `/trash`: 30 min
- `/exports`: 30 min
- `/posts`: 30 min

**Total:** 2-3 hours

**Risk:** LOW
- Easy to measure impact
- No breaking changes
- Can enable/disable easily

---

### 7. Prefetching

**Complexity:** LOW
**Effort:** 1 hour

**Breakdown:**
- Add preload="intent" to Link components: 15 min
- Optional: Add onMouseEnter prefetch: 30 min
- Testing: 15 min

**Risk:** LOW
- Non-breaking addition
- Only benefits on hover
- Easy to remove if issues

---

## Phase-Based Budget

### Phase 1: Immediate Value
| Task | Hours |
|------|-------|
| Search Params (agencies) | 2 |
| Search Params (employees) | 3 |
| DevTools Setup | 0.2 |
| **Phase 1 Total** | **5-6** |

### Phase 2: Foundation
| Task | Hours |
|------|-------|
| Route Groups | 6-10 |
| Selective Loaders | 4-8 |
| **Phase 2 Total** | **10-18** |

### Phase 3: Enhancement
| Task | Hours |
|------|-------|
| beforeLoad Guards | 3-5 |
| Lazy Loading | 1-2 |
| **Phase 3 Total** | **4-7** |

### Grand Total
**19-31 hours** (budget 20-30 hours)

---

## Contingency

Add 20% buffer for unexpected issues:
- Search params edge cases: +2 hours
- Route group refactoring: +2 hours
- Auth integration complications: +2 hours

**Final estimate with contingency:** 25-35 hours

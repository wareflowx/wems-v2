# Implementation Priority Order

This document defines the recommended order for implementing TanStack Router improvements based on priority and dependencies.

---

## Implementation Sequence

| Order | Recommendation | Priority | Effort | Dependencies |
|-------|----------------|----------|--------|--------------|
| 1 | Search Param Schemas | HIGH | 2-3 hrs/page | None |
| 2 | DevTools Configuration | TRIVIAL | 10 min | None |
| 3 | Route Groups | MEDIUM | 6-10 hrs | None |
| 4 | Selective Route Loaders | MEDIUM | 4-8 hrs | None |
| 5 | beforeLoad Guards | MEDIUM | 3-5 hrs | Auth system |
| 6 | Lazy Loading | LOW | 1-2 hrs | None |

---

## Detailed Implementation Plan

### Phase 1: Immediate (This Week)

#### 1. Search Param Schemas

**Priority:** HIGH
**Effort:** 2-3 hours per major filterable page

**Pages to start with:**
1. `/agencies` - Primary business entity with status filter
2. `/employees` - Core entity with department/status filters
3. `/documents` - Common feature with type filters

**Why first:**
- Immediate user value
- Shareable URLs for filtered views
- Type-safe search params
- Browser history integration

---

#### 2. DevTools Setup

**Priority:** TRIVIAL
**Effort:** 10 minutes

**Steps:**
1. Add import to routes.ts
2. Add devtools(router) call
3. Verify in browser DevTools panel

**Why second:**
- Zero risk
- Immediate debugging benefits
- No code changes required

---

### Phase 2: Short-term (This Month)

#### 3. Route Groups

**Priority:** MEDIUM
**Effort:** 6-10 hours total

**Group candidates:**
- Reference data (positions, departments, work-locations, contract-types)
- Employee management (employees list, employee detail)
- Documents (documents list, document detail)

**Migration path:**
1. Create `_reference-data/` folder structure
2. Add `_reference-data-layout.tsx`
3. Move files gradually
4. Test URLs remain unchanged
5. Repeat for other groups

**Why after search params:**
- Search params work regardless of route structure
- Lower risk to implement incrementally

---

#### 4. Selective Route Loaders

**Priority:** MEDIUM
**Effort:** 4-8 hours for key pages

**Key pages to add loaders:**
1. `/agencies` - Preload agency list
2. `/employees` - Preload employee list
3. `/documents` - Preload document list

**Why after route groups:**
- Can add loaders to grouped routes
- Pattern is additive (not breaking)

---

### Phase 3: Mid-term (Next Month)

#### 5. beforeLoad Guards

**Priority:** MEDIUM
**Effort:** 3-5 hours

**Prerequisites:**
- Auth system fully implemented
- User roles/permissions defined
- `/unauthorized` route created

**Routes to protect:**
1. `/settings` - Write operations
2. `/admin` routes if any
3. `/trash` - Destructive actions

**Why later:**
- Depends on auth system
- Can add incrementally
- Low risk to defer

---

#### 6. Lazy Loading

**Priority:** LOW
**Effort:** 1-2 hours

**Routes to lazy load:**
1. `/trash` - Rarely accessed
2. `/exports` - Heavy dependencies
3. `/posts` - Non-core feature

**Why last:**
- Least impactful
- Only when bundle size is a concern
- Can measure before implementing

---

## Risk Mitigation

| Phase | Risk | Mitigation |
|-------|------|------------|
| Search Param Schemas | URL breaking changes | Test thoroughly, use Zod defaults |
| Route Groups | URL changes | Ensure folder names use underscore |
| Loaders | Duplicate fetches | Use queryClient.ensureQueryData |
| beforeLoad | Locked out users | Test both auth states |
| Lazy Loading | Loading flashes | Add Suspense boundaries |

---

## Success Metrics

After each phase, verify:

1. **Search Params:** URL reflects filter state, back/forward works
2. **DevTools:** Route tree visible in DevTools panel
3. **Route Groups:** Shared layouts render correctly
4. **Loaders:** No duplicate fetches, faster initial load
5. **beforeLoad:** Protected routes redirect correctly
6. **Lazy Loading:** Bundle size reduction measurable

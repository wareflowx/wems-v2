# Refactoring Roadmap

## Overview

A phased approach to implementing the code duplication fixes, prioritizing quick wins and low-risk changes before tackling more complex architectural changes.

---

## Phase 1: Quick Wins (Week 1)

**Goal:** Reduce immediate technical debt with low-risk changes

| Task | Effort | Benefit | Risk |
|------|--------|---------|------|
| Extract date-utils.ts | 2-3h | Consistent date handling | NEGLIGIBLE |
| Create dbCall helper | 2-3h | Cleaner database.ts | LOW |
| Extend generic useMutation | 1-2 days | ~400 lines saved | MEDIUM |

### Phase 1 Deliverables

- `lib/date-utils.ts` with `calculateDateStatus()` utility
- `lib/db-call.ts` helper function for database actions
- Enhanced `use-mutation.ts` with duplicate checking and cross-query invalidation

---

## Phase 2: Core Architecture (Weeks 2-3)

**Goal:** Establish the factory pattern for entity hooks

| Task | Effort | Benefit | Risk |
|------|--------|---------|------|
| Design EntitySchema types | 1 day | Foundation for factory | LOW |
| Build CRUD factory function | 2 days | Generates hooks | MEDIUM |
| Migrate agencies hook to factory | 1 day | Proof of concept | LOW |
| Migrate remaining hooks (incremental) | 3-5 days | ~1,200 lines saved | MEDIUM |

### Phase 2 Deliverables

- `lib/entity-schemas.ts` with type-safe entity definitions
- `lib/crud-factory.ts` for generating entity hooks
- Migrated `use-agencies.ts` as reference implementation
- All remaining entity hooks migrated to factory pattern

### Migration Order Recommendation

1. **Agencies** - Proof of concept (1 day)
2. **Employees** - High usage, complex relationships (1 day)
3. **Contracts** - Cross-query dependencies (1 day)
4. **Documents** - Medium complexity (0.5 day)
5. **Medical Visits** - Date handling integration (0.5 day)
6. **Caces** - Date handling integration (0.5 day)
7. **Trainings** - Simpler entity (0.5 day)
8. **Remaining entities** - As needed (0.5 day each)

---

## Phase 3: Advanced Patterns (Week 4+)

**Goal:** Polish and advanced compositions

| Task | Effort | Benefit | Risk |
|------|--------|---------|------|
| DataTable abstraction | 3-4 days | Consistent table UI | HIGH |
| ConfirmationDeleteDialog | 1-2 days | Reusable dialog | LOW |
| Audit logging integration | 2 days | Compliance | MEDIUM |

### Phase 3 Deliverables

- `components/ui/confirmation-delete-dialog.tsx`
- `components/ui/data-table.tsx` (if complexity justifies)
- Audit logging middleware for CRUD operations

---

## Timeline Summary

```
Week 1:  Phase 1 - Quick Wins
         ├─ date-utils.ts (2-3h)
         ├─ dbCall helper (2-3h)
         └─ Extend useMutation (1-2 days)

Weeks 2-3: Phase 2 - Core Architecture
         ├─ EntitySchema types (1 day)
         ├─ CRUD factory (2 days)
         ├─ Agencies migration (1 day)
         └─ Remaining hooks (3-5 days)

Week 4+:  Phase 3 - Advanced Patterns
         ├─ DataTable abstraction (3-4 days)
         ├─ ConfirmationDeleteDialog (1-2 days)
         └─ Audit logging (2 days)
```

---

## Risk Mitigation

1. **Incremental migration** - Each entity migrated and tested before moving to next
2. **Feature flags** - Use query keys to enable/disable new hooks
3. **Parallel runs** - Keep old and new hooks working side-by-side during transition
4. **Comprehensive tests** - E2E tests for all CRUD operations

---

*Roadmap validated by senior architect review*

# Summary Statistics

## Code Duplication Analysis Summary

| Category | Count | Est. Lines | Priority |
|----------|-------|------------|----------|
| Duplicate Hook Patterns | 8 | ~1,800 | HIGH |
| Duplicate Dialog Patterns | 6 | ~800 | MEDIUM |
| Duplicate Utils | 3 | ~50 | LOW |
| Duplicate DB Actions | 1 | ~200 | MEDIUM |
| Duplicate Types | 5 | ~100 | MEDIUM |

## Detailed Breakdown

### Hook Patterns (~1,800 lines)

| Entity Hook | Est. Lines | Patterns |
|-------------|------------|----------|
| use-agencies.ts | ~300 | create, update, delete, list, getById |
| use-employees.ts | ~400 | create, update, delete, list, getById, getByEmployee |
| use-contracts.ts | ~300 | create, update, delete, list |
| use-documents.ts | ~250 | create, update, delete, list |
| use-medical-visits.ts | ~200 | create, update, delete, list |
| use-caces.ts | ~150 | create, update, delete, list |
| use-trainings.ts | ~100 | create, update, delete, list |
| use-schedules.ts | ~100 | create, update, delete, list |

### Dialog Patterns (~800 lines)

| Dialog Component | Est. Lines | Shared Pattern |
|-------------------|------------|----------------|
| DeleteEmployeeDialog.tsx | ~150 | Confirmation + delete action |
| DeleteAgencyDialog.tsx | ~150 | Confirmation + delete action |
| DeleteDocumentDialog.tsx | ~150 | Confirmation + delete action |
| DeleteMedicalVisitDialog.tsx | ~150 | Confirmation + delete action |
| EditEmployeeDialog.tsx | ~100 | Form + save action |
| EditAgencyDialog.tsx | ~100 | Form + save action |

### Utility Functions (~50 lines)

| Utility | Est. Lines | Usage |
|---------|------------|-------|
| calculateVisitStatus | ~30 | use-medical-visits.ts |
| calculateCaceStatus | ~30 | use-caces.ts |
| formatDate | ~10 | Multiple files |

### Database Actions (~200 lines)

| Pattern | Repetitions | Est. Lines |
|---------|-------------|------------|
| Client null-check wrapper | ~50 | database.ts |

---

## Grand Totals

| Metric | Value |
|--------|-------|
| Total Duplicate Patterns | 15+ |
| Total Estimated Lines Duplicated | ~2,950 |
| Total Potential Lines Saved | ~1,500 |
| Percentage Reduction | 50% |

---

*Statistics compiled from static code analysis*

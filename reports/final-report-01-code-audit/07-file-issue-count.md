# File-by-File Issue Count

## Overview

The following table shows the distribution of issues across files in the codebase.

## Issue Count by File

| File | Issues |
|------|--------|
| `src/core/ipc/database/handlers.ts` | 15+ |
| `src/renderer/src/actions/database.ts` | 12+ |
| `src/renderer/src/pages/employees-page.tsx` | 8+ |
| `src/renderer/src/pages/online-trainings-page.tsx` | 12+ |
| `src/renderer/src/pages/driving-authorizations-page.tsx` | 10+ |
| `src/renderer/src/pages/caces-page.tsx` | 5+ |
| `src/renderer/src/components/employees/DeleteEmployeeDialog.tsx` | 3 |
| `src/renderer/src/components/documents/DeleteDocumentDialog.tsx` | 3 |
| `src/renderer/src/components/medical-visits/DeleteMedicalVisitDialog.tsx` | 3 |
| `src/preload/index.ts` | 5 |
| `src/main/index.ts` | 10+ |
| `src/renderer/src/components/ui/chart.tsx` | 2 |

## Category Breakdown

| Category | Files Affected | Total Issues |
|----------|---------------|--------------|
| Database handlers | 1 | 15+ |
| Database actions | 1 | 12+ |
| Pages | 6 | 50+ |
| Dialog components | 3 | 9 |
| Preload | 1 | 5 |
| Main process | 1 | 10+ |
| UI components | 1 | 2 |

## Top Priority Files to Address

1. **DeleteEmployeeDialog.tsx** - Critical functionality not implemented
2. **DeleteDocumentDialog.tsx** - Critical functionality not implemented
3. **DeleteMedicalVisitDialog.tsx** - Critical functionality not implemented
4. **medical-visits-page.tsx** - Edit functionality missing
5. **preload/index.ts** - Security vulnerability (postMessage)

---

## Severity Distribution

| Severity | Count | Description |
|----------|-------|-------------|
| P0 | 2 | Must fix immediately (delete, edit) |
| P1 | 6 | High priority (security, stability) |
| P2 | 10+ | Medium priority (code quality) |
| P3 | 15+ | Low priority (refactoring) |
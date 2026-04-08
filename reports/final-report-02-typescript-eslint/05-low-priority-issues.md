# Low Priority Issues (P3)

These are style issues and auto-fixable problems that have minimal impact on functionality. They can be fixed quickly with automated tools.

---

## 1. Auto-Fixable Style Issues

### Node Protocol (7 files)

**Before:**
```typescript
import * as fs from "fs";
```

**After:**
```typescript
import * as fs from "node:fs";
```

**Files affected:**
- scripts/fix-alias.js
- scripts/migrate-agencies.js
- scripts/migrate-contracts-agency.js
- scripts/revert-alias.js
- scripts/run-notes-migration.js
- csv-exporter.ts
- excel-exporter.ts

**Fix:** Run `eslint --fix` on these files to automatically apply the fix.

---

### Template Literals (2 files)

**Before:**
```typescript
const path = basePath + "/" + filename;
```

**After:**
```typescript
const path = `${basePath}/${filename}`;
```

**Fix:** Run `eslint --fix` to automatically apply the fix.

---

## 2. Auto-Generated File with Suppressions

**File:** `src/routesTree.gen.ts`

**Content:**
```typescript
/* eslint-disable */    // Line 1
// @ts-nocheck         // Line 3
```

**Important:** This file is **intentionally** generated with suppressions. TanStack Router generates this file automatically, and it should **NOT** be manually edited. Any changes will be overwritten on the next generation.

---

## Summary

| Issue Type | Files Affected | Fix Effort | Method |
|------------|---------------|------------|--------|
| Node protocol | 7 files | 15-30 min | eslint --fix |
| Template literals | 2 files | 5-10 min | eslint --fix |
| Auto-generated suppressions | 1 file | N/A | Intentional |

**Total P3 Effort:** 1-2 hours (all auto-fixable)

---

## Recommendations

1. **Run `eslint --fix`** on a regular basis to catch auto-fixable issues
2. **Do not modify** `routesTree.gen.ts` - it is auto-generated
3. **Configure pre-commit hook** to catch style issues before they enter the codebase

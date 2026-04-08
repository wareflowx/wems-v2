# Root Cause Analysis

## Root Causes Identified

### 1. ORPC Typing Not Propagating

**Symptom:** `TS18046: 'input' is of type 'unknown'` in handler functions

**Root Cause:** The `os.handler()` generic types are not being properly inferred. Handlers are not declaring input types explicitly.

**Evidence:**
```typescript
// Current (broken)
export const createPost = os.handler(async ({ input }) => {
  // input is unknown
});

// Should be
export const createPost = os.handler(async ({ input }: { input: CreatePostInput }) => {
  // input is properly typed
});
```

**Fix:** Explicitly declare input types using Zod schema inference.

---

### 2. Zod Transforms vs Drizzle Types

**Symptom:** `TS2322: Type 'string' is not assignable to type 'SQLiteColumn<...>'`

**Root Cause:** Schema transforms create types that don't match Drizzle column types. When you use `.transform()` in Zod, the output type may differ from the expected Drizzle column type.

**Evidence:**
```typescript
// Zod schema with transform
const schema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
});

// Inferred type is string, but Drizzle expects specific column type
```

**Fix:** Move transforms out of Zod schema and apply them after parsing, or ensure schema types align with Drizzle types.

---

### 3. Type Narrowing Missing

**Symptom:** `TS2322: Type 'unknown' is not assignable to type 'boolean'`

**Root Cause:** `result.value` is not being narrowed properly after `isSuccess()` check. Type narrowing does not work correctly across the return type boundary.

**Evidence:**
```typescript
// Current (broken)
export const isWriteMode = (): boolean => {
  const result = Lock.isWriteMode();
  return isSuccess(result) ? result.value : true;  // result.value is unknown
};

// Fixed
export const isWriteMode = (): boolean => {
  const result = Lock.isWriteMode();
  if (isSuccess(result)) {
    return Boolean(result.value);  // Explicitly narrow
  }
  return true;
};
```

**Fix:** Use explicit type narrowing with `if` statements instead of ternary operators for complex type narrowing scenarios.

---

### 4. Manual Import Duplication

**Symptom:** `TS2300: Duplicate identifier 'and'` and `'isNull'`

**Root Cause:** Code editing error where import statements were duplicated instead of merged. This is a human error during merge or edit operations.

**Evidence:**
```typescript
// Line 31
import { and, desc, eq, gt, isNull, not } from "drizzle-orm";

// Line 2770 (duplicate)
import { and, gte, isNull, lte } from "drizzle-orm";
```

**Fix:** Merge duplicate imports into single import statement.

---

## Not Root Causes

The following were investigated but determined **not** to be root causes:

### 1. TypeScript Strict Mode
**Status:** Not a root cause

`strict: true` is correct and should remain enabled. The errors are legitimate type safety issues that strict mode correctly identifies.

### 2. ESLint Configuration
**Status:** Not a root cause

The ultracite ESLint setup is reasonable. The errors are real code issues, not configuration problems.

### 3. Drizzle ORM Itself
**Status:** Not a root cause

The Drizzle ORM library is well-typed. The issues stem from incorrect usage patterns (e.g., using transforms incorrectly with Drizzle types).

---

## Summary

| Root Cause | Impact | Fix Effort |
|------------|--------|------------|
| ORPC typing not propagating | 50+ TS errors | 4-6 hours |
| Zod transforms vs Drizzle types | 20+ TS errors | 6-8 hours |
| Type narrowing missing | 2 TS errors | 1-2 hours |
| Manual import duplication | 2 TS errors | 15 minutes |

**Key Insight:** Most TypeScript errors stem from improper type annotation rather than tool configuration issues. The fix is in the code, not the configuration.

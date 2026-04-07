# Medium Priority Issues (P2)

These issues affect code quality and type safety but do not block compilation. They should be addressed as part of regular maintenance.

---

## 1. Catch Block Typing (138 instances)

**Current Pattern:**
```typescript
} catch (error) {  // Implicit any
  console.error("Error:", error);
}
```

**Best Practice:**
```typescript
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

**ESLint Rule Fix:**
```javascript
{
  rules: {
    "@typescript-eslint/consistent-catch-clause": [
      "error",
      { "baseClass": "Error", "allowKnownErrors": true }
    ]
  }
}
```

**Effort:** 15-20 hours to fix all instances (138 occurrences across the codebase).

---

## 2. Unused `input` Parameter in Error Interceptor

**Report Error:** Unused variable `input` in error interceptor

**Fix:**
```typescript
onError((error, { path: _path, input: _input }) => {
  // Now explicitly marked as intentionally unused
})
```

**Effort:** 10 minutes.

---

## 3. `forEach` Instead of Proper Iteration (`manager.ts` Line 129)

**Current Pattern:**
```typescript
this._readyListeners.forEach((listener) => listener(true));
```

**Issues:**
- `forEach` does not wait for async operations
- Array is being modified during iteration
- Does not clear the listeners array after calling

**Fix:**
```typescript
for (const listener of this._readyListeners) {
  listener(true);
}
this._readyListeners = [];
```

**Effort:** 30 minutes.

---

## Summary

| Issue | Instances | Estimated Effort |
|-------|-----------|------------------|
| Catch block typing | 138 | 15-20 hours |
| Unused input param | 1 | 10 minutes |
| forEach iteration | 1 | 30 minutes |
| **Total P2** | | **16-21 hours** |

---

## ESLint Pattern Issues

Additional ESLint errors in the following files:

| File | Issue | Fix Effort |
|------|-------|------------|
| manager.ts | forEach iteration pattern | 30 min |
| export-history.ts | ESLint patterns | 1-2 hours |

---

*Note: Catch block typing is the largest effort item in this category. Consider automating the fix using codemods if available.*

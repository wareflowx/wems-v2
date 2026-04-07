# High Priority Issues (P1)

## 3. No React Error Boundaries (NEW FINDING)

**Finding:** The codebase has **NO React Error Boundaries** despite being an Electron application with complex state management.

**Industry Standard Pattern:**
```typescript
// components/error-boundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex h-screen items-center justify-center">
          <h1>Something went wrong</h1>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Business Risk:** HIGH - Any unhandled error crashes the entire app

---

## 4. Widespread `any` Type

The codebase has extensive use of `any` type, which bypasses TypeScript's type safety:

**Critical Files (>5 occurrences):**
- `src/routesTree.gen.ts` - 18 occurrences (auto-generated)
- `src/pages/driving-authorizations-page.tsx` - 18 occurrences
- `src/pages/online-trainings-page.tsx` - 15 occurrences
- `src/pages/employee-detail-page.tsx` - 11 occurrences
- `src/pages/positions-page.tsx` - 10 occurrences

**Remediation Example:**
```typescript
// Instead of: catch (error: any)
// Use: catch (error: unknown), then narrow

} catch (error: unknown) {
  if (
    error instanceof Error &&
    (error as NodeJS.ErrnoException).code === "SQLITE_CONSTRAINT_UNIQUE"
  ) {
    // Handle unique constraint
  }
}

// Instead of: createEmployee(data: any)
// Use: proper input type

interface CreateEmployeeInput {
  name: string;
  email: string;
  departmentId: number;
}

export async function createEmployee(data: CreateEmployeeInput) {
  // Type-safe implementation
}
```

---

## 5. postMessage Wildcard Origin

**File:** `src/preload/index.ts` (lines 76, 100)

```typescript
window.postMessage({ type: "main-ready" }, "*");
window.postMessage({ type: "orpc-port-ready" }, "*", [port]);
```

**Research Citation - MDN postMessage Security:**

> **"Always specify an exact target origin, not `*`, when you use `postMessage` to send data to other windows."**

**Remediation:**
```typescript
// Use same-origin instead of wildcard
window.postMessage({ type: "main-ready" }, window.location.origin);
window.postMessage({ type: "orpc-port-ready" }, window.location.origin, [port]);
```

---

## 6. XSS in Chart Component

**Finding Validation:** PARTIALLY CONFIRMED - Risk is lower than stated

**Why lower than stated:**
- CSS cannot execute JavaScript directly
- CSS injection for XSS requires injecting event handlers via CSS - very limited
- Colors are injected as CSS property VALUES, not content

**Remediation:**
```typescript
// Validate hex color format
if (color && /^#[0-9A-Fa-f]{3,6}$/.test(color)) {
  return `  --color-${key}: ${color};`;
}
```

Or use DOMPurify with CSS profile.

---

## 7. TODO Comments Left Behind

**Locations:**
- `src/main/index.ts` (line 76) - `// TODO: Re-enable after optimizing update check`
- `src/renderer/src/components/employees/DeleteEmployeeDialog.tsx` (line 35)
- `src/renderer/src/components/documents/DeleteDocumentDialog.tsx` (line 51)
- `src/renderer/src/components/medical-visits/DeleteMedicalVisitDialog.tsx` (line 51)
- `src/renderer/src/pages/medical-visits-page.tsx` (line 278)

**Priority:** Only 2 are critical (the delete and edit functionality)

---

## 8. Shell Operations Without Path Validation

**File:** `src/core/ipc/database/handlers.ts` (lines 3046-3073)

```typescript
export const openExportedFile = os.handler(
  async ({ input }: { input: { filePath: string } }) => {
    try {
      const { shell } = await import("electron");
      await shell.openPath(input.filePath);  // No validation of filePath
```

---

## Summary

| Issue | Risk | Files Affected |
|-------|------|----------------|
| No React Error Boundaries | App crash | Entire application |
| Widespread `any` Type | Runtime errors | Multiple pages |
| postMessage Wildcard Origin | Security | preload/index.ts |
| XSS in Chart Component | Security | chart.tsx |
| TODO Comments | Technical debt | 5 locations |
| Shell Operations Without Path Validation | Security | handlers.ts |
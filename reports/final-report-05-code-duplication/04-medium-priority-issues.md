# MEDIUM Priority Issues

## Issue 1: Duplicate Date/Calendar Status Calculation

### Files Affected
- `src/renderer/src/hooks/use-medical-visits.ts` - `calculateVisitStatus()` (lines 32-59)
- `src/renderer/src/hooks/use-caces.ts` - `calculateCaceStatus()` (lines 31-53)

### Similarity
90%

### Recommended Utility

```typescript
// lib/date-utils.ts
export interface DateStatusConfig<T extends string> {
  expiredThreshold: number;
  warningThreshold?: number;
  statuses: {
    expired: T;
    warning: T;
    valid: T;
    completed?: T;
    cancelled?: T;
  };
}

export function calculateDateStatus<T extends string>(
  targetDate: string,
  currentStatus: string,
  config: DateStatusConfig<T>
): { days: number; status: T } {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate); target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine status based on days
  let status: T;
  if (days <= config.expiredThreshold) {
    status = config.statuses.expired;
  } else if (config.warningThreshold && days <= config.warningThreshold) {
    status = config.statuses.warning;
  } else {
    status = config.statuses.valid;
  }

  return { days, status };
}
```

### Impact

| Metric | Value |
|--------|-------|
| Effort | 2-3 hours |
| Lines saved | ~100 |
| Risk | LOW |
| Priority | MEDIUM |

---

## Issue 2: Confirmation Delete Dialog Composition

### Files Affected
- `src/renderer/src/components/employees/DeleteEmployeeDialog.tsx`
- `src/renderer/src/components/documents/DeleteDocumentDialog.tsx`
- `src/renderer/src/components/medical-visits/DeleteMedicalVisitDialog.tsx`

### Similarity
80%

### Recommended Pattern: Compound Component from shadcn/ui

```typescript
// components/ui/confirmation-delete-dialog.tsx
interface ConfirmationDeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  itemName: string;
  itemDescription?: string;
  warningText?: string;
  requireConfirmation?: boolean;
  onConfirm?: () => void;
}

export function ConfirmationDeleteDialog({
  open,
  onOpenChange,
  itemName,
  itemDescription,
  warningText,
  requireConfirmation = true,
  onConfirm,
}: ConfirmationDeleteDialogProps) {
  // Implementation
}

// Usage
<ConfirmationDeleteDialog
  itemName="Agency"
  itemDescription="This action cannot be undone."
  onConfirm={() => deleteAgency(id)}
/>
```

### Impact

| Metric | Value |
|--------|-------|
| Effort | 1-2 days |
| Lines saved | ~300 |
| Risk | LOW |
| Priority | MEDIUM |

---

## Issue 3: Database Action Wrapper Pattern

### File Affected
`src/renderer/src/actions/database.ts` (1046 lines)

### Current Pattern - Repeated ~50 times

```typescript
export async function getEmployees() {
  const client = getClient();
  if (!client) { return []; }
  return client.database.getEmployees();
}
```

### Recommended Pattern

```typescript
async function dbCall<T>(
  fn: (client: ORPCClient) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = getClient();
  if (!client) { return fallback; }
  return fn(client);
}

export const getEmployees = () => dbCall(c => c.database.getEmployees(), []);
export const createEmployee = (data: any) => dbCall(c => c.database.createEmployee(data), null);
```

### Impact

| Metric | Value |
|--------|-------|
| Effort | 2-3 hours |
| Lines saved | ~200 |
| Risk | LOW |
| Priority | MEDIUM |

---

*All medium priority issues confirmed by code analysis*

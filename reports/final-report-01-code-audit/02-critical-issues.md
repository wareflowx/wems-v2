# Critical Issues (P0 - Must Fix Immediately)

## 1. Incomplete Delete Operations

**Files Affected:**
- `src/renderer/src/components/employees/DeleteEmployeeDialog.tsx` (line 35)
- `src/renderer/src/components/documents/DeleteDocumentDialog.tsx` (line 51)
- `src/renderer/src/components/medical-visits/DeleteMedicalVisitDialog.tsx` (line 51)

**Description:**
These delete dialogs have `// TODO: Implement backend logic` comments and only log to console without actually calling any backend service. This means delete operations are silently ignored.

**Code Example - BROKEN:**
```typescript
// DeleteEmployeeDialog.tsx:34-39
const handleDelete = () => {
  // TODO: Implement backend logic
  console.log(`Deleting employee: ${employeeId} - ${employeeName}`);
  onConfirm?.();
  onOpenChange?.(false);
  setConfirmationName("");
};
```

---

### Business Risk Assessment

- Users can interact with delete UI but nothing happens
- Creates **false confidence** in the system
- **GDPR/Compliance Implication:** Proper deletion handling is often legally required
- Ghost features in production

---

### OWASP Delete Operation Standards

Enterprise applications must implement:
1. User confirmation with explicit entity name typing (already done correctly)
2. Backend validation before deletion
3. Optimistic UI with rollback on failure (pattern exists in `use-agencies.ts`)
4. Audit logging of deletion events
5. Soft-delete vs hard-delete strategy

---

### Correct Pattern (from use-agencies.ts)

```typescript
// CORRECT - This is how deletes should work
export function useDeleteAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteAgency(id),  // Backend call!

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.agencies.lists() });
      const previousQueries = new Map();
      queryClient.getQueriesData({ queryKey: queryKeys.agencies.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Agency[]);
      });
      queryClient.setQueriesData(
        { queryKey: queryKeys.agencies.lists() },
        (old: Agency[] = []) => old.filter((agency) => agency.id !== id)
      );
      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }
      toast({ title: "Failed to delete agency", variant: "destructive" });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies.lists() });
      toast({ title: "Agency deleted successfully" });
    },
  });
}
```

---

### Specific Remediation Steps

1. Check if `deleteEmployee`, `deleteDocument`, `deleteMedicalVisit` exist in `src/renderer/src/actions/database.ts`
2. If they exist, wire them to the dialog components
3. If they don't exist, implement them following `use-agencies.ts` pattern
4. Connect to TanStack Query mutation with optimistic updates

---

## 2. Missing Edit Functionality

**File:**
- `src/renderer/src/pages/medical-visits-page.tsx` (line 278)

```typescript
// TODO: Implement edit functionality
console.log("Edit visit:", visit);
```

**Business Risk:** Medical visits cannot be edited - this is a **core CRUD operation missing**.

---

## Summary

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| Incomplete Delete Operations | Data integrity, compliance | 3 dialog components |
| Missing Edit Functionality | Core feature missing | medical-visits-page.tsx |
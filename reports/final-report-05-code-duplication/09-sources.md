# Sources and References

## Documentation

- [TanStack Query Documentation](https://tanstack.com/query/latest) - React Query hooks patterns and best practices
- [React Design Patterns](https://react.dev/learn) - Compound components and composition patterns
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type-safe generic patterns

## Code References

### Existing Generic Hook
- `src/renderer/src/hooks/use-mutation.ts` - Existing but unused generic mutation hook

### Entity Hooks with Manual Implementations
- `src/renderer/src/hooks/use-agencies.ts`
- `src/renderer/src/hooks/use-employees.ts`
- `src/renderer/src/hooks/use-contracts.ts`
- `src/renderer/src/hooks/use-documents.ts`
- `src/renderer/src/hooks/use-medical-visits.ts`
- `src/renderer/src/hooks/use-caces.ts`
- `src/renderer/src/hooks/use-trainings.ts`
- `src/renderer/src/hooks/use-schedules.ts`

### Dialog Components
- `src/renderer/src/components/employees/DeleteEmployeeDialog.tsx`
- `src/renderer/src/components/agencies/DeleteAgencyDialog.tsx`
- `src/renderer/src/components/documents/DeleteDocumentDialog.tsx`
- `src/renderer/src/components/medical-visits/DeleteMedicalVisitDialog.tsx`

### Table Components
- `src/renderer/src/components/agencies/AgencyTable.tsx`
- `src/renderer/src/components/employees/employees-table.tsx`

### Database Layer
- `src/renderer/src/actions/database.ts` - Database action wrappers

## External Libraries

- [shadcn/ui](https://ui.shadcn.com/) - Confirmation dialog compound component patterns
- [@tanstack/react-query](https://tanstack.com/query/latest) - Query key management and invalidation
- [TanStack Table](https://tanstack.com/table/latest) - DataTable abstraction patterns

## Analysis Methodology

1. **Static code analysis** - Manual inspection of all entity hooks
2. **Pattern identification** - Similarity scoring based on code structure
3. **Senior peer review** - Validation by Principal Software Architect
4. **Industry research** - Cross-reference with React/TypeScript best practices

---

*Report generated on 2026-04-07*
*Analysis by Claude Sonnet 4.6*
*Senior Review by Principal Software Architect*

# LOW Priority: DataTable Abstraction

## Files Affected

- `src/renderer/src/components/agencies/AgencyTable.tsx` (104 lines)
- `src/renderer/src/components/employees/employees-table.tsx` (494 lines)

## Overview

Both components implement data tables with similar patterns:
- Column definitions
- Row rendering
- Sorting/filtering
- Pagination integration

## Recommendation

Build a generic `DataTable` component with configurable columns, but the complexity vs. benefit ratio is lower compared to other refactoring opportunities.

## Proposed Generic Pattern

```typescript
interface DataTableProps<TData, TColumn extends ColumnDef<TData>> {
  data: TData[];
  columns: TColumn[];
  loading?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Usage
const columns: ColumnDef<Agency>[] = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('code', { header: 'Code' }),
  // ...
];

<DataTable
  data={agencies}
  columns={columns}
  pagination={{ page: 1, pageSize: 10, total: 100 }}
/>
```

## Why LOW Priority

1. **High complexity** - Table UI has many variations
2. **Entity-specific logic** - Each table has unique requirements
3. **Lower duplication ratio** - 104 lines vs 494 lines indicates the smaller component may not have enough shared logic
4. **Better ROI elsewhere** - Other refactoring efforts yield more lines per hour

## Impact Assessment

| Metric | Value |
|--------|-------|
| Effort | 3-4 days |
| Lines saved | ~400 |
| Risk | HIGH |
| Priority | LOW |

## Recommendation

Postpone DataTable abstraction until Phase 3 (Week 4+) after core architecture refactoring is complete. Revisit if a clear abstraction pattern emerges during the CRUD factory implementation.

---

*Low priority based on complexity vs. benefit analysis*

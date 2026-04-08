// useFilteredData - Generic hook for filtering data with search and filters
// Usage: const filteredData = useFilteredData(data, { search, filters })

import { useMemo } from "react";

export interface UseFilteredDataOptions<TItem> {
  search?: string;
  searchFields?: (keyof TItem)[];
  filters?: Partial<Record<keyof TItem, string | number | boolean | undefined>>;
}

/**
 * Generic hook for filtering data with search and filters
 *
 * @example
 * ```typescript
 * const filteredAgencies = useFilteredData(agencies, {
 *   search,
 *   searchFields: ["name", "code"],
 *   filters: { isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined },
 * });
 * ```
 */
export function useFilteredData<TItem extends Record<string, unknown>>(
  data: TItem[],
  options: UseFilteredDataOptions<TItem>
): TItem[] {
  const { search, searchFields, filters } = options;

  return useMemo(() => {
    let result = data;

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();

      result = result.filter((item) => {
        // If searchFields specified, only search in those fields
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((field) => {
            const value = item[field];
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchLower);
            }
            if (typeof value === "number") {
              return value.toString().includes(search);
            }
            return false;
          });
        }

        // Default: search in all string fields
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === "number") {
            return value.toString().includes(search);
          }
          return false;
        });
      });
    }

    // Apply other filters
    if (filters) {
      (Object.keys(filters) as (keyof TItem)[]).forEach((key) => {
        const value = filters[key];
        if (value === undefined) {
          return;
        }

        result = result.filter((item) => {
          const itemValue = item[key];
          return itemValue === value;
        });
      });
    }

    return result;
  }, [data, search, searchFields, filters]);
}

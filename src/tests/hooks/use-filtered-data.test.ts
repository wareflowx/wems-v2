import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilteredData } from "@/hooks/use-filtered-data";

interface TestItem {
  id: number;
  name: string;
  code: string | null;
  isActive: boolean;
}

const mockData: TestItem[] = [
  { id: 1, name: "Agency Alpha", code: "ALPHA", isActive: true },
  { id: 2, name: "Agency Beta", code: "BETA", isActive: false },
  { id: 3, name: "Agency Gamma", code: "GAMMA", isActive: true },
  { id: 4, name: "Inactive Agency", code: "INACT", isActive: false },
];

describe("useFilteredData", () => {
  it("returns original data when no filters applied", () => {
    const { result } = renderHook(() => useFilteredData(mockData, {}));
    expect(result.current).toEqual(mockData);
  });

  it("filters by search term in specified searchFields", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        search: "alpha",
        searchFields: ["name"],
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Agency Alpha");
  });

  it("filters by search term in all string fields when searchFields not specified", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        search: "beta",
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Agency Beta");
  });

  it("search is case insensitive", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        search: "ALPHA",
        searchFields: ["name"],
      })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Agency Alpha");
  });

  it("filters by exact match from filters object", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        filters: { isActive: true },
      })
    );
    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.isActive)).toBe(true);
  });

  it("combines search and filters with AND logic", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        search: "agency",
        searchFields: ["name"],
        filters: { isActive: true },
      })
    );
    expect(result.current).toHaveLength(2);
    expect(
      result.current.every(
        (item) => item.isActive && item.name.includes("Agency")
      )
    ).toBe(true);
  });

  it("ignores undefined filter values", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        filters: { isActive: undefined },
      })
    );
    expect(result.current).toHaveLength(4);
  });

  it("returns empty array when no matches", () => {
    const { result } = renderHook(() =>
      useFilteredData(mockData, {
        search: "nonexistent",
      })
    );
    expect(result.current).toHaveLength(0);
  });
});

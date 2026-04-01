import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMetrics, useStatusMetrics } from "@/hooks/use-metrics";

interface TestItem {
  id: number;
  name: string;
  isActive: boolean;
}

const mockData: TestItem[] = [
  { id: 1, name: "Item A", isActive: true },
  { id: 2, name: "Item B", isActive: false },
  { id: 3, name: "Item C", isActive: true },
  { id: 4, name: "Item D", isActive: false },
];

describe("useMetrics", () => {
  it("returns correct count for total", () => {
    const { result } = renderHook(() =>
      useMetrics(mockData, {
        total: { value: (items) => items.length },
      })
    );
    expect(result.current.total).toBe(4);
  });

  it("returns correct count for active items", () => {
    const { result } = renderHook(() =>
      useMetrics(mockData, {
        active: { value: (items) => items.filter((i) => i.isActive).length },
      })
    );
    expect(result.current.active).toBe(2);
  });

  it("returns correct count for inactive items", () => {
    const { result } = renderHook(() =>
      useMetrics(mockData, {
        inactive: { value: (items) => items.filter((i) => !i.isActive).length },
      })
    );
    expect(result.current.inactive).toBe(2);
  });

  it("returns 0 for all metrics when data is empty", () => {
    const { result } = renderHook(() =>
      useMetrics(mockData.slice(0, 0), {
        total: { value: (items) => items.length },
        active: { value: (items) => items.filter((i) => i.isActive).length },
        inactive: { value: (items) => items.filter((i) => !i.isActive).length },
      })
    );
    expect(result.current.total).toBe(0);
    expect(result.current.active).toBe(0);
    expect(result.current.inactive).toBe(0);
  });

  it("supports multiple custom metrics", () => {
    const { result } = renderHook(() =>
      useMetrics(mockData, {
        total: { value: (items) => items.length },
        active: { value: (items) => items.filter((i) => i.isActive).length },
        inactive: { value: (items) => items.filter((i) => !i.isActive).length },
        activePercentage: { value: (items) => (items.filter((i) => i.isActive).length / items.length) * 100 },
      })
    );
    expect(result.current.total).toBe(4);
    expect(result.current.active).toBe(2);
    expect(result.current.inactive).toBe(2);
    expect(result.current.activePercentage).toBe(50);
  });
});

describe("useStatusMetrics", () => {
  it("returns correct structure with prefix", () => {
    const { result } = renderHook(() =>
      useStatusMetrics(mockData, "isActive", "items")
    );
    expect(result.current).toHaveProperty("itemsTotal");
    expect(result.current).toHaveProperty("itemsActive");
    expect(result.current).toHaveProperty("itemsInactive");
  });

  it("returns correct counts for total items", () => {
    const { result } = renderHook(() =>
      useStatusMetrics(mockData, "isActive", "items")
    );
    expect(result.current.itemsTotal).toBe(4);
  });

  it("returns correct counts for active items", () => {
    const { result } = renderHook(() =>
      useStatusMetrics(mockData, "isActive", "items")
    );
    expect(result.current.itemsActive).toBe(2);
  });

  it("returns correct counts for inactive items", () => {
    const { result } = renderHook(() =>
      useStatusMetrics(mockData, "isActive", "items")
    );
    expect(result.current.itemsInactive).toBe(2);
  });

  it("returns 0 for all when data is empty", () => {
    const { result } = renderHook(() =>
      useStatusMetrics<TestItem, "isActive", "items">([], "isActive", "items")
    );
    expect(result.current.itemsTotal).toBe(0);
    expect(result.current.itemsActive).toBe(0);
    expect(result.current.itemsInactive).toBe(0);
  });
});

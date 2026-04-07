// useMetrics - Generic hook for calculating KPI metrics from data
// Usage: const metrics = useMetrics(data, { total: true, active: (item) => item.isActive })

import { useMemo } from "react";

export type MetricFn<TItem> = (items: TItem[]) => number;

export interface MetricDefinition<TItem, TKey extends string> {
  label?: string;
  value: MetricFn<TItem>;
}

export type MetricsConfig<TItem, TKey extends string> = Record<
  TKey,
  MetricDefinition<TItem, TKey>
>;

// Pre-defined common metric definitions
export const commonMetricFns = {
  total: <TItem extends { length: number }>(items: TItem[]): number =>
    items.length,
  active: <TItem extends { isActive?: boolean }>(items: TItem[]): number =>
    items.filter((i) => i.isActive === true).length,
  inactive: <TItem extends { isActive?: boolean }>(items: TItem[]): number =>
    items.filter((i) => i.isActive === false).length,
} as const;

/**
 * Generic hook for calculating KPI metrics from data
 *
 * @example
 * ```typescript
 * const metrics = useMetrics(agencies, {
 *   totalAgencies: { value: (items) => items.length },
 *   activeAgencies: { value: (items) => items.filter((a) => a.isActive).length },
 *   inactiveAgencies: { value: (items) => items.filter((a) => !a.isActive).length },
 * });
 *
 * // Or with the built-in helpers:
 * const metrics = useMetrics(agencies, {
 *   totalAgencies: { value: commonMetricFns.total },
 *   activeAgencies: { value: commonMetricFns.active },
 * });
 * ```
 */
export function useMetrics<
  TItem extends Record<string, unknown>,
  TKey extends string,
>(data: TItem[], config: MetricsConfig<TItem, TKey>): Record<TKey, number> {
  return useMemo(() => {
    const result = {} as Record<TKey, number>;

    (Object.keys(config) as TKey[]).forEach((key) => {
      const metric = config[key];
      result[key] = metric.value(data);
    });

    return result;
  }, [data, config]);
}

/**
 * Metrics for boolean status fields (like isActive)
 *
 * @example
 * ```typescript
 * const metrics = useStatusMetrics(agencies, "isActive", "agencies");
 * // Returns: { totalAgencies: 10, activeAgencies: 8, inactiveAgencies: 2 }
 * ```
 */
export function useStatusMetrics<
  TItem extends Record<string, unknown>,
  TStatusKey extends keyof TItem,
  TPrefix extends string,
>(
  data: TItem[],
  statusField: TStatusKey,
  prefix: TPrefix
): Record<
  `${TPrefix}Total` | `${TPrefix}Active` | `${TPrefix}Inactive`,
  number
> {
  return useMetrics(data, {
    [`${prefix}Total`]: { value: (items: TItem[]) => items.length },
    [`${prefix}Active`]: {
      value: (items: TItem[]) =>
        items.filter((item) => item[statusField] === true).length,
    },
    [`${prefix}Inactive`]: {
      value: (items: TItem[]) =>
        items.filter((item) => item[statusField] === false).length,
    },
  });
}

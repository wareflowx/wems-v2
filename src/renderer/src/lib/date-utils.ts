// Date utility functions for status calculations
// Centralized to avoid duplication across hooks

export interface DateStatusConfig<T extends string> {
  expiredThreshold: number; // Days after which status is "expired"
  warningThreshold?: number; // Days after which status is "warning" (if provided)
  statuses: {
    expired: T;
    warning: T;
    valid: T;
  };
}

/**
 * Calculate date status based on target date relative to today
 *
 * @param targetDate - ISO date string to compare against today
 * @param config - Configuration for thresholds and status values
 * @returns Object with days difference and calculated status
 */
export function calculateDateStatus<T extends string>(
  targetDate: string,
  config: DateStatusConfig<T>
): { days: number; status: T } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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

/**
 * Standard medical visit status config (overdue/scheduled/valid)
 */
export const medicalVisitStatusConfig = {
  expiredThreshold: 0,
  statuses: {
    expired: "overdue" as const,
    warning: "scheduled" as const,
    valid: "scheduled" as const,
  },
};

/**
 * Standard CACES status config (expired/warning/valid)
 */
export const cacesStatusConfig = {
  expiredThreshold: 0,
  warningThreshold: 30,
  statuses: {
    expired: "expired" as const,
    warning: "warning" as const,
    valid: "valid" as const,
  },
};

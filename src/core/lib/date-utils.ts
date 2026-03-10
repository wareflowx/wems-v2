/**
 * Date utility functions for export functionality
 */

export type DateRange = 'today' | '7days' | '30days' | 'all';

export interface DateRangeParams {
  start?: Date;
  end?: Date;
}

/**
 * Get date range parameters from DateRange string
 */
export const getDateRangeParams = (dateRange: DateRange): DateRangeParams => {
  const now = new Date();

  switch (dateRange) {
    case 'today': {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: startOfDay, end: now };
    }
    case '7days': {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: sevenDaysAgo, end: now };
    }
    case '30days': {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: thirtyDaysAgo, end: now };
    }
    case 'all':
    default:
      return {};
  }
};

/**
 * Get export directory path
 */
export const getExportDir = (app: { getPath: (name: string) => string }): string => {
  const documentsPath = app.getPath('documents');
  return `${documentsPath}/WEMS/exports`;
};

/**
 * Generate export filename
 */
export const generateExportFilename = (format: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `export-${timestamp}.${format}`;
};

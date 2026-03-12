/**
 * Excel Exporter - generates XLSX files with multi-sheet support
 */

import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Employee, Attachment } from '@/core/db/schema';
import type { Media } from '@/core/db/schema';
import { generateCsv } from './csv-exporter';

export type ExportType = 'employees' | 'attachments' | 'media';

export type ExportData = Partial<Record<ExportType, Employee[] | Attachment[] | Media[]>>;

// Column mappings with date formatting info
const EMPLOYEE_COLUMNS: { key: string; prop: keyof Employee; isDate?: boolean }[] = [
  { key: 'ID', prop: 'id' },
  { key: 'First Name', prop: 'firstName' },
  { key: 'Last Name', prop: 'lastName' },
  { key: 'Email', prop: 'email' },
  { key: 'Phone', prop: 'phone' },
  { key: 'Status', prop: 'status' },
  { key: 'Hire Date', prop: 'hireDate', isDate: true },
  { key: 'Department', prop: 'department' },
  { key: 'Created At', prop: 'createdAt', isDate: true },
];

const ATTACHMENT_COLUMNS: { key: string; prop: keyof Attachment; isDate?: boolean }[] = [
  { key: 'ID', prop: 'id' },
  { key: 'Employee ID', prop: 'employeeId' },
  { key: 'Type', prop: 'entityType' },
  { key: 'Entity ID', prop: 'entityId' },
  { key: 'Original Name', prop: 'originalName' },
  { key: 'MIME Type', prop: 'mimeType' },
  { key: 'Size (bytes)', prop: 'size' },
  { key: 'Created At', prop: 'createdAt', isDate: true },
];

const MEDIA_COLUMNS: { key: string; prop: keyof Media; isDate?: boolean }[] = [
  { key: 'ID', prop: 'id' },
  { key: 'Name', prop: 'name' },
  { key: 'Type', prop: 'type' },
  { key: 'File Name', prop: 'fileName' },
  { key: 'MIME Type', prop: 'mimeType' },
  { key: 'Size (bytes)', prop: 'size' },
  { key: 'Created At', prop: 'createdAt', isDate: true },
];

const SHEET_NAMES: Record<ExportType, string> = {
  employees: 'Employees',
  attachments: 'Attachments',
  media: 'Media',
};

const getColumns = (type: ExportType) => {
  switch (type) {
    case 'employees':
      return EMPLOYEE_COLUMNS;
    case 'attachments':
      return ATTACHMENT_COLUMNS;
    case 'media':
      return MEDIA_COLUMNS;
  }
};

/**
 * Parse date string to Date object
 */
const parseDate = (value: string | Date | null | undefined): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
};

/**
 * Generate Excel file by converting CSV data
 */
export const generateExcel = async (data: ExportData): Promise<Buffer> => {
  // Create a temp directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wems-export-'));

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'WEMS';
    workbook.created = new Date();

    for (const type of ['employees', 'attachments', 'media'] as ExportType[]) {
      const records = data[type];
      if (!records || records.length === 0) continue;

      const columns = getColumns(type);
      const sheet = workbook.addWorksheet(SHEET_NAMES[type]);

      // Add header
      sheet.addRow(columns.map(c => c.key));

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Add data rows
      for (const record of records) {
        const row: (string | number | Date) = [];

        for (const col of columns) {
          const value = (record as Record<string, unknown>)[col.prop];

          if (col.isDate && value) {
            const dateValue = parseDate(value as string | Date);
            row.push(dateValue as Date);
          } else {
            row.push(String(value ?? ''));
          }
        }

        sheet.addRow(row);
      }

      // Auto-fit columns
      sheet.columns.forEach((column) => {
        column.width = 15;
      });
    }

    // Write to temp file
    const tempFile = path.join(tempDir, 'export.xlsx');
    await workbook.xlsx.writeFile(tempFile);

    // Read back as buffer
    return fs.readFileSync(tempFile);
  } finally {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

/**
 * Write Excel file to disk
 */
export const writeExcelToFile = async (data: ExportData, filePath: string): Promise<void> => {
  const buffer = await generateExcel(data);
  await fs.promises.writeFile(filePath, buffer);
};

/**
 * Get file extension
 */
export const getExcelExtension = (): string => 'xlsx';

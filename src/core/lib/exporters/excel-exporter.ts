/**
 * Excel Exporter - generates XLSX files with multi-sheet support
 */

import ExcelJS from 'exceljs';
import * as fs from 'fs';
import type { Employee, Attachment } from '@/core/db/schema';
import type { Media } from '@/core/db/schema';

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
 * Generate Excel file
 */
export const generateExcel = async (data: ExportData): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WEMS';
  workbook.created = new Date();

  for (const type of ['employees', 'attachments', 'media'] as ExportType[]) {
    const records = data[type];
    if (!records || records.length === 0) continue;

    const columns = getColumns(type);
    const sheet = workbook.addWorksheet(SHEET_NAMES[type]);

    // Add header row
    const headerRow = sheet.addRow(columns.map(c => c.key));

    // Style headers
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Add data rows
    for (const record of records) {
      const row: (string | number | Date | undefined)[] = [];

      for (const col of columns) {
        const value = record[col.prop as keyof typeof record];

        if (col.isDate && value) {
          const dateValue = parseDate(value as string | Date);
          row.push(dateValue);
        } else {
          row.push(value as string | number | undefined);
        }
      }

      const dataRow = sheet.addRow(row);

      // Apply date formatting to date columns
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].isDate) {
          const cell = dataRow.getCell(i + 1);
          cell.numFmt = 'dd/mm/yyyy';
        }
      }
    }

    // Auto-fit columns
    sheet.columns.forEach((column, index) => {
      const maxLength = Math.max(
        ...(sheet.getColumn(index + 1).values as string[]).map(v => String(v).length),
        columns[index].key.length
      );
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });
  }

  return await workbook.xlsx.writeBuffer() as Buffer;
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

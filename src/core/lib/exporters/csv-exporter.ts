/**
 * CSV Exporter - generates CSV files with UTF-8 BOM for Excel compatibility
 */

import Papa from 'papaparse';
import archiver from 'archiver';
import * as fs from 'fs';
import type { Employee, Attachment } from '@/core/db/schema';
import type { Media } from '@/core/db/schema';

export type ExportType = 'employees' | 'attachments' | 'media';

export type ExportData = Partial<Record<ExportType, Employee[] | Attachment[] | Media[]>>;

// Column mappings for each type
const EMPLOYEE_COLUMNS: Record<string, keyof Employee> = {
  'ID': 'id',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Email': 'email',
  'Phone': 'phone',
  'Status': 'status',
  'Hire Date': 'hireDate',
  'Department': 'department',
  'Created At': 'createdAt',
};

const ATTACHMENT_COLUMNS: Record<string, keyof Attachment> = {
  'ID': 'id',
  'Employee ID': 'employeeId',
  'Type': 'entityType',
  'Entity ID': 'entityId',
  'Original Name': 'originalName',
  'MIME Type': 'mimeType',
  'Size (bytes)': 'size',
  'Created At': 'createdAt',
};

const MEDIA_COLUMNS: Record<string, keyof Media> = {
  'ID': 'id',
  'Name': 'name',
  'Type': 'type',
  'File Name': 'fileName',
  'MIME Type': 'mimeType',
  'Size (bytes)': 'size',
  'Created At': 'createdAt',
};

const FILE_NAMES: Record<ExportType, string> = {
  employees: 'employees.csv',
  attachments: 'attachments.csv',
  media: 'media.csv',
};

const getColumns = (type: ExportType): Record<string, keyof Employee | keyof Attachment | keyof Media> => {
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
 * Map record to CSV row
 */
const mapToRow = (
  type: ExportType,
  record: Employee | Attachment | Media
): Record<string, unknown> => {
  const columns = getColumns(type);
  const row: Record<string, unknown> = {};

  for (const [label, key] of Object.entries(columns)) {
    const value = (record as Record<string, unknown>)[key as string];
    row[label] = value ?? '';
  }

  return row;
};

/**
 * Generate CSV buffer for single or multiple types
 */
export const generateCsv = (data: ExportData): Buffer => {
  const rows: Record<string, unknown>[] = [];

  for (const [type, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;

    for (const record of records) {
      rows.push(mapToRow(type as ExportType, record));
    }
  }

  const csv = Papa.unparse(rows, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ';',
    header: true,
    newline: '\r\n',
  });

  // Add UTF-8 BOM for Excel compatibility
  return Buffer.from('\uFEFF' + csv, 'utf8');
};

/**
 * Generate ZIP buffer for multiple types
 */
export const generateCsvZip = async (data: ExportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    for (const [type, records] of Object.entries(data)) {
      if (!records || records.length === 0) continue;

      const mapped = records.map(record => mapToRow(type as ExportType, record));

      const csv = Papa.unparse(mapped, {
        quotes: true,
        delimiter: ';',
        header: true,
        newline: '\r\n',
      });

      archive.append('\uFEFF' + csv, { name: FILE_NAMES[type as ExportType] });
    }

    archive.finalize();
  });
};

/**
 * Write CSV/ZIP to file
 */
export const writeCsvToFile = async (
  data: ExportData,
  filePath: string,
  isMultiType: boolean
): Promise<void> => {
  if (isMultiType) {
    const buffer = await generateCsvZip(data);
    await fs.promises.writeFile(filePath, buffer);
  } else {
    const buffer = generateCsv(data);
    await fs.promises.writeFile(filePath, buffer);
  }
};

/**
 * Get file extension
 */
export const getCsvExtension = (isMultiType: boolean): string => {
  return isMultiType ? 'zip' : 'csv';
};

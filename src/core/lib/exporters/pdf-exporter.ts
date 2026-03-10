/**
 * PDF Exporter - generates PDF files with landscape orientation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Employee, Attachment } from '@/core/db/schema';
import type { Media } from '@/core/db/schema';

export type ExportType = 'employees' | 'attachments' | 'media';

export type ExportData = Partial<Record<ExportType, Employee[] | Attachment[] | Media[]>>;

// Column configurations optimized for landscape A4
const EMPLOYEE_COLUMNS = [
  { header: 'ID', dataKey: 'id' },
  { header: 'Last Name', dataKey: 'lastName' },
  { header: 'First Name', dataKey: 'firstName' },
  { header: 'Email', dataKey: 'email' },
  { header: 'Status', dataKey: 'status' },
  { header: 'Hire Date', dataKey: 'hireDate' },
];

const ATTACHMENT_COLUMNS = [
  { header: 'ID', dataKey: 'id' },
  { header: 'Employee', dataKey: 'employeeId' },
  { header: 'Type', dataKey: 'entityType' },
  { header: 'File Name', dataKey: 'originalName' },
  { header: 'Size', dataKey: 'size' },
];

const MEDIA_COLUMNS = [
  { header: 'ID', dataKey: 'id' },
  { header: 'Name', dataKey: 'name' },
  { header: 'Type', dataKey: 'type' },
  { header: 'File Name', dataKey: 'fileName' },
];

const SECTION_TITLES: Record<ExportType, string> = {
  employees: 'Employee List',
  attachments: 'Attachment List',
  media: 'Media List',
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
 * Generate PDF file
 */
export const generatePdf = async (data: ExportData): Promise<Buffer> => {
  // Use LANDSCAPE orientation for better table readability
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Cover page
  doc.setFontSize(24);
  doc.text('Export WEMS', 148, 40, { align: 'center' });

  doc.setFontSize(12);
  const exportDate = new Date().toLocaleString('en-GB');
  doc.text('Export Date: ' + exportDate, 148, 55, { align: 'center' });

  const selectedTypes = Object.keys(data).filter(k => data[k as ExportType]?.length > 0);
  doc.text('Data Types: ' + selectedTypes.join(', '), 148, 65, { align: 'center' });

  const totalRecords = Object.values(data).flat().length;
  doc.text('Total Records: ' + totalRecords, 148, 75, { align: 'center' });

  // Calculate page dimensions for landscape
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Generate table for each data type
  for (const type of ['employees', 'attachments', 'media'] as ExportType[]) {
    const records = data[type];
    if (!records || records.length === 0) continue;

    // Add new page for each section
    doc.addPage('landscape');

    // Section title
    doc.setFontSize(16);
    doc.text(SECTION_TITLES[type], margin, 20);

    // Prepare table data with truncation
    const columns = getColumns(type);
    const tableData = records.map(record => {
      const row: Record<string, unknown> = {};
      for (const col of columns) {
        const value = record[col.dataKey as keyof typeof record];
        // Truncate long values (max 40 chars in table)
        row[col.dataKey] = value !== null && value !== undefined
          ? String(value).substring(0, 40)
          : '';
      }
      return row;
    });

    // Draw table with autoTable
    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: tableData.map(row => columns.map(c => String(row[c.dataKey]))),
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      margin: { top: 30, right: margin, bottom: 20, left: margin },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        // Add page number in footer
        doc.setFontSize(9);
        const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(
          'Page ' + pageNum,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });
  }

  return doc.output('arraybuffer') as unknown as Buffer;
};

/**
 * Write PDF file to disk
 */
export const writePdfToFile = async (data: ExportData, filePath: string): Promise<void> => {
  const buffer = await generatePdf(data);
  await fs.promises.writeFile(filePath, Buffer.from(buffer));
};

/**
 * Get file extension
 */
export const getPdfExtension = (): string => 'pdf';

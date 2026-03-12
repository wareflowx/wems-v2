import { os } from "@orpc/server";
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

export type ExportType = "employees" | "attachments" | "media";
export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportHistoryRecord {
  id: string;
  timestamp: string;
  types: ExportType[];
  format: ExportFormat;
  recordCount: number;
  filePath: string;
}

const getHistoryPath = (): string => {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "exports-history.json");
};

const loadHistory = (): ExportHistoryRecord[] => {
  try {
    const filePath = getHistoryPath();
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading export history:", error);
    return [];
  }
};

const saveHistory = (history: ExportHistoryRecord[]): void => {
  try {
    const filePath = getHistoryPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error saving export history:", error);
  }
};

export const getExportHistory = os.handler(async () => {
  return loadHistory();
});

export const addExportToHistory = os.handler(
  async ({ input }: { input: { types: ExportType[]; format: ExportFormat; recordCount: number; filePath: string } }) => {
    const history = loadHistory();

    const record: ExportHistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      types: input.types,
      format: input.format,
      recordCount: input.recordCount,
      filePath: input.filePath,
    };

    // Add to beginning, keep only last 100
    history.unshift(record);
    const trimmed = history.slice(0, 100);

    saveHistory(trimmed);

    return { success: true };
  }
);

export const deleteExportFromHistory = os.handler(
  async ({ input }: { input: { id: string } }) => {
    const history = loadHistory();
    const filtered = history.filter((r) => r.id !== input.id);
    saveHistory(filtered);
    return { success: true };
  }
);

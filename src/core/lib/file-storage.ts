import path from "node:path";
import fs from "node:fs";
import { getDataDir, ensureDataDir } from "@/core/db";

/**
 * Get the files directory path
 */
export function getFilesDir(): string {
  ensureDataDir();
  return path.join(getDataDir(), "files");
}

/**
 * Ensure a directory exists, create if it doesn't
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Save a file to disk
 * @param buffer - The file buffer
 * @param relativePath - Path relative to files directory (e.g., "media/logos/logo.png")
 * @returns The full path where file was saved
 * @throws Error if path traversal is detected
 */
export function saveFile(buffer: Buffer, relativePath: string): string {
  const filesDir = getFilesDir();
  const fullPath = path.join(filesDir, relativePath);

  // CRITICAL: Verify the resolved path is within filesDir (prevent path traversal)
  const normalizedPath = path.normalize(fullPath);
  const normalizedFilesDir = path.normalize(filesDir);
  if (!normalizedPath.startsWith(normalizedFilesDir + path.sep) && normalizedPath !== normalizedFilesDir) {
    throw new Error("Invalid file path: path traversal detected");
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(fullPath);
  ensureDir(parentDir);

  // Write file
  fs.writeFileSync(fullPath, buffer);

  return fullPath;
}

/**
 * Delete a file from disk
 * @param relativePath - Path relative to files directory
 * @returns true if file was deleted, false if it didn't exist
 * @throws Error if path traversal is detected
 */
export function deleteFile(relativePath: string): boolean {
  const filesDir = getFilesDir();
  const fullPath = path.join(filesDir, relativePath);

  // CRITICAL: Verify the resolved path is within filesDir (prevent path traversal)
  const normalizedPath = path.normalize(fullPath);
  const normalizedFilesDir = path.normalize(filesDir);
  if (!normalizedPath.startsWith(normalizedFilesDir + path.sep) && normalizedPath !== normalizedFilesDir) {
    throw new Error("Invalid file path: path traversal detected");
  }

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }

  return false;
}

/**
 * Read a file from disk
 * @param relativePath - Path relative to files directory
 * @returns The file buffer, or null if doesn't exist
 * @throws Error if path traversal is detected
 */
export function readFile(relativePath: string): Buffer | null {
  const filesDir = getFilesDir();
  const fullPath = path.join(filesDir, relativePath);

  // CRITICAL: Verify the resolved path is within filesDir (prevent path traversal)
  const normalizedPath = path.normalize(fullPath);
  const normalizedFilesDir = path.normalize(filesDir);
  if (!normalizedPath.startsWith(normalizedFilesDir + path.sep) && normalizedPath !== normalizedFilesDir) {
    throw new Error("Invalid file path: path traversal detected");
  }

  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath);
  }

  return null;
}

/**
 * Get full path for a relative file path
 */
export function getFullPath(relativePath: string): string {
  const filesDir = getFilesDir();
  return path.join(filesDir, relativePath);
}

/**
 * Check if file exists
 */
export function fileExists(relativePath: string): boolean {
  const filesDir = getFilesDir();
  const fullPath = path.join(filesDir, relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Generate a unique filename with UUID prefix
 */
export function generateStoredFileName(uuid: string, originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  // Replace spaces and special chars in base name
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${uuid}_${safeBaseName}${ext}`;
}

/**
 * Get the relative path for a media file
 */
export function getMediaPath(type: string, fileName: string): string {
  return path.join("media", type, fileName);
}

/**
 * Slugify a string for use in file paths
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Get the relative path for an attachment
 * Uses employeeName if provided for a more readable path
 */
export function getAttachmentPath(
  entityType: string,
  employeeId: number,
  fileName: string,
  employeeName?: string
): string {
  const folderName = employeeName
    ? `${employeeId}-${slugify(employeeName)}`
    : employeeId.toString();
  return path.join(entityType, folderName, fileName);
}

import { app } from "electron";
import { Lock } from "@@/lib/lock";
import { isSuccess } from "@@/lib/result";
import path from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// Lazy database initialization to avoid Vite bundling issues with native modules
let db: ReturnType<typeof drizzle> | null = null;

const inDevelopment = process.env.NODE_ENV === "development";

/**
 * Get the effective data directory for the database.
 * In dev: project root /data folder
 * In prod: app.getPath("userData")/data (NSIS guarantees it's writable)
 */
export function getEffectiveDataDir(): string {
  if (inDevelopment) {
    return path.join(process.cwd(), "data");
  }
  return path.join(app.getPath("userData"), "data");
}

/**
 * Get data directory path.
 * Kept for backward compatibility - now simply returns userData path.
 */
export const getDataDir = getEffectiveDataDir;

export function ensureDataDir(): void {
  const dataDir = getEffectiveDataDir();
  if (!require("node:fs").existsSync(dataDir)) {
    require("node:fs").mkdirSync(dataDir, { recursive: true });
  }
}

function getDbPath(): string {
  const dbFileName = "database.db";
  const dataDir = getEffectiveDataDir();
  return path.join(dataDir, dbFileName);
}

function logToFile(message: string, error?: unknown): void {
  try {
    const fs = require("node:fs");
    ensureDataDir();
    const logPath = path.join(getEffectiveDataDir(), "debug.log");
    const timestamp = new Date().toISOString();
    const logMessage = error
      ? `${timestamp} - ${message}: ${(error as Error).message}\n${(error as Error).stack}\n`
      : `${timestamp} - ${message}\n`;
    fs.appendFileSync(logPath, logMessage);
  } catch {
    console.error("Failed to write log:", error);
  }
}

async function runMigrations(
  sqlite: unknown,
  canWrite: boolean
): Promise<void> {
  try {
    // Only run migrations if in write mode
    if (!canWrite) {
      logToFile("Read-only mode: skipping migrations");
      return;
    }

    const dbInstance = drizzle({ client: sqlite });

    // Check existing tables
    const tables = (
      sqlite as { prepare: (sql: string) => { all: () => { name: string }[] } }
    )
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();

    logToFile(`Existing tables: ${JSON.stringify(tables)}`);

    // If no tables exist, run migrations
    if (tables.length === 0) {
      logToFile("No tables found, running migrations...");

      // Get migrations folder path
      // Use process.resourcesPath for production (standard Electron API for extraResources)
      const migrationsPath = inDevelopment
        ? path.join(process.cwd(), "src/db/migrations")
        : path.join(process.resourcesPath, "migrations");

      logToFile(`Migrations path: ${migrationsPath}`);

      // Run migrations using drizzle (synchronous for better-sqlite3)
      migrate(dbInstance, { migrationsFolder: migrationsPath });

      logToFile("Migrations completed successfully");
    } else {
      logToFile("Tables already exist, skipping migrations");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logToFile(`Error running migrations: ${message}`, error);
    throw new Error(`Failed to run database migrations: ${message}`);
  }
}

// Re-export Lock functions for backward compatibility
export const acquireWriteLock = (): boolean => {
  const result = Lock.acquire();
  return isSuccess(result) ? result.value : false;
};

export const releaseWriteLock = (): void => {
  const result = Lock.release();
  if (!isSuccess(result)) {
    logToFile(`Error releasing lock: ${result.error.message}`);
  }
};

export const isWriteMode = (): boolean => {
  const result = Lock.isWriteMode();
  return isSuccess(result) ? result.value : true;
};

export const startLockWatcher = (
  callback: (isWriteMode: boolean) => void,
  intervalMs = 2000
): (() => void) => {
  return Lock.watch(callback, intervalMs);
};

export async function getDb(canWrite = true) {
  if (!db) {
    try {
      logToFile("Initializing database...");

      // Load better-sqlite3 using require to avoid asar issues
      const Database = require("better-sqlite3");
      logToFile("Loaded better-sqlite3 via module.require");

      // Open database in read-only mode if lock exists
      const sqlite = canWrite
        ? new Database(getDbPath())
        : new Database(getDbPath(), { readonly: true });
      logToFile("Database connection created");

      // Enable WAL mode for better concurrency (only if not already WAL)
      const currentMode = sqlite.pragma("journal_mode", { simple: true });
      if (currentMode !== "wal") {
        sqlite.pragma("journal_mode = WAL");
      }

      // Run migrations (only in write mode)
      await runMigrations(sqlite, canWrite);

      db = drizzle({ client: sqlite });
      logToFile(`✅ Database initialized at: ${getDbPath()}`);
    } catch (error) {
      logToFile("Fatal error in getDb", error);
      throw error;
    }
  }
  return db;
}

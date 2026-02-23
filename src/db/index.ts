import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { Lock } from '@/lib/lock';
import { isSuccess } from '@/lib/result';

// Lazy database initialization to avoid Vite bundling issues with native modules
let db: ReturnType<typeof drizzle> | null = null;

const inDevelopment = process.env.NODE_ENV === 'development';

function getDataDir(): string {
  // In production: use executable directory
  // In development: use project root
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(app.getPath('exe'));

  return path.join(baseDir, 'data');
}

function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!require('fs').existsSync(dataDir)) {
    try {
      require('fs').mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create data directory at ${dataDir}:`, error);
      throw new Error(`Cannot create data directory: ${dataDir}`);
    }
  }
}

function getDbPath(): string {
  // Default database file name
  const dbFileName = 'database.db';

  // Ensure data directory exists
  ensureDataDir();

  return path.join(getDataDir(), dbFileName);
}

function logToFile(message: string, error?: unknown): void {
  try {
    const fs = require('fs');
    ensureDataDir();
    const logPath = path.join(getDataDir(), 'debug.log');
    const timestamp = new Date().toISOString();
    const logMessage = error
      ? `${timestamp} - ${message}: ${(error as Error).message}\n${(error as Error).stack}\n`
      : `${timestamp} - ${message}\n`;
    fs.appendFileSync(logPath, logMessage);
  } catch {
    console.error('Failed to write log:', error);
  }
}

async function runMigrations(sqlite: unknown, canWrite: boolean): Promise<void> {
  try {
    // Only run migrations if in write mode
    if (!canWrite) {
      logToFile('Read-only mode: skipping migrations');
      return;
    }

    const dbInstance = drizzle({ client: sqlite });

    // Check existing tables
    const tables = (sqlite as { prepare: (sql: string) => { all: () => { name: string }[] } }).prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();

    logToFile('Existing tables: ' + JSON.stringify(tables));

    // If no tables exist, run migrations
    if (tables.length === 0) {
      logToFile('No tables found, running migrations...');

      // Get migrations folder path
      // Use process.resourcesPath for production (standard Electron API for extraResources)
      const migrationsPath = inDevelopment
        ? path.join(process.cwd(), 'src/db/migrations')
        : path.join(process.resourcesPath, 'migrations');

      logToFile('Migrations path: ' + migrationsPath);

      // Run migrations using drizzle (synchronous for better-sqlite3)
      migrate(dbInstance, { migrationsFolder: migrationsPath });

      logToFile('Migrations completed successfully');
    } else {
      logToFile('Tables already exist, skipping migrations');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logToFile('Error running migrations: ' + message, error);
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
    logToFile('Error releasing lock: ' + result.error.message);
  }
};

export const isWriteMode = (): boolean => {
  const result = Lock.isWriteMode();
  return isSuccess(result) ? result.value : true;
};

export const startLockWatcher = (callback: (isWriteMode: boolean) => void, intervalMs: number = 2000): (() => void) => {
  return Lock.watch(callback, intervalMs);
};

export async function getDb() {
  if (!db) {
    try {
      logToFile('Initializing database...');

      // Acquire write lock (or read-only mode)
      const canWrite = acquireWriteLock();
      logToFile(canWrite ? 'Write mode enabled' : 'Read-only mode enabled');

      // Load better-sqlite3 using module.require to avoid asar issues
      const Database = module.require('better-sqlite3');
      logToFile('Loaded better-sqlite3 via module.require');

      // Open database in read-only mode if lock exists
      const sqlite = canWrite
        ? new Database(getDbPath())
        : new Database(getDbPath(), { readonly: true });
      logToFile('Database connection created');

      // Enable WAL mode for better concurrency
      sqlite.pragma('journal_mode = WAL');

      // Run migrations (only in write mode)
      await runMigrations(sqlite, canWrite);

      db = drizzle({ client: sqlite });
      logToFile(`✅ Database initialized at: ${getDbPath()}`);
    } catch (error) {
      logToFile('Fatal error in getDb', error);
      throw error;
    }
  }
  return db;
}

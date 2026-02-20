import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';
import os from 'os';

// Lock file configuration
const LOCK_FILE_NAME = '.write.lock';
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Lazy database initialization to avoid Vite bundling issues with native modules
let db: ReturnType<typeof drizzle> | null = null;

const inDevelopment = process.env.NODE_ENV === 'development';

function getDataDir() {
  // In production: use executable directory
  // In development: use project root
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(app.getPath('exe'));

  return path.join(baseDir, 'data');
}

function ensureDataDir() {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create data directory at ${dataDir}:`, error);
      throw new Error(`Cannot create data directory: ${dataDir}`);
    }
  }
  return dataDir;
}

function getDbPath() {
  // Default database file name
  const dbFileName = 'database.db';

  // Ensure data directory exists
  ensureDataDir();

  return path.join(getDataDir(), dbFileName);
}

function getLockFilePath() {
  return path.join(getDataDir(), LOCK_FILE_NAME);
}

interface LockData {
  userId: string;
  hostname: string;
  timestamp: number;
  pid: number;
}

function acquireWriteLock(): boolean {
  const lockPath = getLockFilePath();

  try {
    if (fs.existsSync(lockPath)) {
      try {
        const lockData: LockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
        const age = Date.now() - lockData.timestamp;

        if (age < LOCK_TIMEOUT_MS) {
          // Lock is fresh, read-only mode
          logToFile(`Read-only mode: another user (${lockData.userId}@${lockData.hostname}) has write access`);
          return false;
        } else {
          // Lock is stale, remove it
          logToFile('Removing stale write lock');
          fs.unlinkSync(lockPath);
        }
      } catch {
        // Lock file corrupted, remove it
        logToFile('Removing corrupted write lock');
        fs.unlinkSync(lockPath);
      }
    }

    // Create new lock
    const lockData: LockData = {
      userId: os.userInfo().username,
      hostname: os.hostname(),
      timestamp: Date.now(),
      pid: process.pid
    };
    fs.writeFileSync(lockPath, JSON.stringify(lockData));
    logToFile('Write lock acquired');
    return true;
  } catch (error) {
    logToFile('Error acquiring write lock', error);
    return false;
  }
}

export function releaseWriteLock() {
  try {
    const lockPath = getLockFilePath();
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      logToFile('Write lock released');
    }
  } catch (error) {
    logToFile('Error releasing write lock', error);
  }
}

export function isWriteMode(): boolean {
  const lockPath = getLockFilePath();
  if (!fs.existsSync(lockPath)) {
    return true;
  }

  try {
    const lockData: LockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    return (Date.now() - lockData.timestamp) >= LOCK_TIMEOUT_MS;
  } catch {
    return true;
  }
}

function logToFile(message: string, error?: any) {
  try {
    ensureDataDir();
    const logPath = path.join(getDataDir(), 'debug.log');
    const timestamp = new Date().toISOString();
    const logMessage = error
      ? `${timestamp} - ${message}: ${error.message}\n${error.stack}\n`
      : `${timestamp} - ${message}\n`;
    fs.appendFileSync(logPath, logMessage);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

async function runMigrations(sqlite: any, canWrite: boolean) {
  try {
    // Only run migrations if in write mode
    if (!canWrite) {
      logToFile('Read-only mode: skipping migrations');
      return;
    }

    // Check existing tables
    const tables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();

    logToFile('Existing tables: ' + JSON.stringify(tables));

    // If no tables exist, run migrations
    if (tables.length === 0) {
      logToFile('No tables found, running migrations...');

      const db = drizzle({ client: sqlite });

      // Get migrations folder path
      const migrationsPath = inDevelopment
        ? path.join(process.cwd(), 'src/db/migrations')
        : path.join(process.resourcesPath, 'migrations');

      logToFile('Migrations path: ' + migrationsPath);

      // Run migrations using drizzle (synchronous for better-sqlite3)
      migrate(db, { migrationsFolder: migrationsPath });

      logToFile('Migrations completed successfully');
    } else {
      logToFile('Tables already exist, skipping migrations');
    }
  } catch (error) {
    logToFile('Error running migrations', error);
    throw error;
  }
}

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

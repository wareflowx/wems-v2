import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';

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
    fs.mkdirSync(dataDir, { recursive: true });
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

function logToFile(message: string, error?: any) {
  const logPath = path.join(app.getPath('userData'), 'debug.log');
  const timestamp = new Date().toISOString();
  const logMessage = error
    ? `${timestamp} - ${message}: ${error.message}\n${error.stack}\n`
    : `${timestamp} - ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
}

async function runMigrations(sqlite: any) {
  try {
    // Check existing tables
    const tables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();

    logToFile('Existing tables: ' + JSON.stringify(tables));

    // If no tables exist, we need to run migrations
    // For now, just ensure the basic tables exist
    // Full migrations are handled by drizzle-kit
  } catch (error) {
    logToFile('Error running migrations', error);
    throw error;
  }
}

export async function getDb() {
  if (!db) {
    try {
      logToFile('Initializing database...');

      // Load better-sqlite3 using module.require to avoid asar issues
      const Database = module.require('better-sqlite3');
      logToFile('Loaded better-sqlite3 via module.require');

      const sqlite = new Database(getDbPath());
      logToFile('Database connection created');

      // Enable WAL mode for better concurrency
      sqlite.pragma('journal_mode = WAL');

      // Run migrations
      await runMigrations(sqlite);

      db = drizzle({ client: sqlite });
      logToFile(`✅ Database initialized at: ${getDbPath()}`);
    } catch (error) {
      logToFile('Fatal error in getDb', error);
      throw error;
    }
  }
  return db;
}

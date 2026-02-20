import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/migrator';
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

async function runMigrations(sqlite: any) {
  try {
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
        : path.join(path.dirname(app.getPath('exe')), 'resources/migrations');

      logToFile('Migrations path: ' + migrationsPath);

      // Run migrations using drizzle
      await migrate(db, { migrationsFolder: migrationsPath });

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

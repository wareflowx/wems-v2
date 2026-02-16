import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';

// Lazy database initialization to avoid Vite bundling issues with native modules
let db: ReturnType<typeof drizzle> | null = null;

function getDbPath() {
  return path.join(app.getPath('userData'), 'database.db');
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
    // Create posts table if it doesn't exist
    const tableExists = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"
    ).get();

    if (!tableExists) {
      logToFile('Creating posts table...');
      sqlite.exec(`
        CREATE TABLE posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL
        )
      `);
      logToFile('✅ Posts table created');
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

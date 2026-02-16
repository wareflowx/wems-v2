import path from 'path';
import { app } from 'electron';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Lazy database initialization to avoid Vite bundling issues with native modules
let db: ReturnType<typeof drizzle> | null = null;

function getDbPath() {
  return path.join(app.getPath('userData'), 'database.db');
}

async function runMigrations(sqlite: any) {
  // Create posts table if it doesn't exist
  const tableExists = sqlite.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"
  ).get();

  if (!tableExists) {
    console.log('Creating posts table...');
    sqlite.exec(`
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);
    console.log('✅ Posts table created');
  }
}

export async function getDb() {
  if (!db) {
    // Dynamic import to avoid Vite trying to bundle the native module
    const Database = (await import('better-sqlite3')).default;
    const sqlite = new Database(getDbPath());

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');

    // Run migrations
    await runMigrations(sqlite);

    db = drizzle({ client: sqlite });
    console.log('✅ Database initialized at:', getDbPath());
  }
  return db;
}

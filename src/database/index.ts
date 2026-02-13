import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import * as schema from './schema';

/**
 * Get the database file path in the OS-specific userData directory
 *
 * Locations by OS:
 * - Windows: %APPDATA%/electron-shadcn/database.db
 * - macOS: ~/Library/Application Support/electron-shadcn/database.db
 * - Linux: ~/.config/electron-shadcn/database.db
 */
const dbPath = path.join(app.getPath('userData'), 'database.db');

console.log('📁 Database path:', dbPath);

/**
 * Create SQLite connection with better-sqlite3
 * Using WAL mode (Write-Ahead Logging) for better performance
 */
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

/**
 * Drizzle ORM instance with schema
 * This will be used throughout the application
 */
export const db = drizzle(sqlite, { schema });

/**
 * Export initialization functions
 */
export { initializeDatabase, seedDatabase } from './init';

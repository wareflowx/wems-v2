// Script to apply migration directly using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.db');
console.log('Opening database at:', dbPath);

const db = new Database(dbPath);

try {
  console.log('Creating agencies table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS agencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      is_active INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      deleted_at TEXT
    )
  `);

  console.log('Adding agency_id column to employees...');
  try {
    db.exec('ALTER TABLE employees ADD COLUMN agency_id integer');
    // Note: Foreign key constraint is not added via ALTER TABLE in SQLite
    // The FK will work at application level
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('Column already exists, skipping...');
    } else {
      throw e;
    }
  }

  console.log('Adding company_name column to settings...');
  try {
    db.exec('ALTER TABLE settings ADD COLUMN company_name TEXT');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('Column already exists, skipping...');
    } else {
      throw e;
    }
  }

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}

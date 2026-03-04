// Script to add agency_id to contracts table
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.db');
console.log('Opening database at:', dbPath);

const db = new Database(dbPath);

try {
  console.log('Adding agency_id column to contracts...');
  try {
    db.exec('ALTER TABLE contracts ADD COLUMN agency_id integer');
    // Note: Foreign key constraint is not added via ALTER TABLE in SQLite
    // The FK will work at application level
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
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

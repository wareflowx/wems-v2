const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(import.meta.dirname, "..", "data", "database.db");
const db = new Database(dbPath);

// Run the notes migration
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_completed INTEGER DEFAULT 0 NOT NULL,
    badges TEXT DEFAULT '[]' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TEXT
  );
`);

// Add badges column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE notes ADD COLUMN badges TEXT DEFAULT '[]'`);
  console.log("Badges column added successfully");
} catch (e) {
  if (e.message.includes("duplicate column name")) {
    console.log("Badges column already exists");
  } else {
    console.log("Notes table ready");
  }
}

console.log("Notes migration completed successfully");

db.close();

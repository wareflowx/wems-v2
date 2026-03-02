import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "database.db");

console.log("Connecting to database at:", dbPath);

const db = new Database(dbPath);

// Enable WAL mode
db.pragma("journal_mode = WAL");

// Check existing tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Existing tables:", tables.map(t => t.name));

// Create driving_authorizations table if not exists
if (!tables.find(t => t.name === "driving_authorizations")) {
  console.log("Creating driving_authorizations table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS driving_authorizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      license_category TEXT NOT NULL,
      date_obtained TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      attachment_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      deleted_by TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE SET NULL
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_da_employee ON driving_authorizations(employee_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_da_expiration ON driving_authorizations(expiration_date)`);
  console.log("Created driving_authorizations table and indexes");
} else {
  console.log("driving_authorizations table already exists");
}

// Create online_trainings table if not exists
if (!tables.find(t => t.name === "online_trainings")) {
  console.log("Creating online_trainings table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS online_trainings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      training_name TEXT NOT NULL,
      training_provider TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      expiration_date TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      attachment_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      deleted_by TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE SET NULL
    )
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_ot_employee ON online_trainings(employee_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ot_expiration ON online_trainings(expiration_date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ot_status ON online_trainings(status)`);
  console.log("Created online_trainings table and indexes");
} else {
  console.log("online_trainings table already exists");
}

console.log("Migration completed successfully!");

db.close();

import { getDb } from "@/core/db";
import { drivingAuthorizations, onlineTrainings } from "@/core/db/schema";
import { isNull } from "drizzle-orm";

async function main() {
  console.log("Starting migration...");

  const db = getDb();

  // Check if tables already exist
  const existingTables = await db.select({ name: 1 })
    .from("sqlite_master")
    .where({ type: "table" }) as { name: string }[];

  const tableNames = existingTables.map(t => t.name);

  console.log("Existing tables:", tableNames);

  // Create driving_authorizations table if not exists
  if (!tableNames.includes("driving_authorizations")) {
    console.log("Creating driving_authorizations table...");
    await db.execute(`
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
    console.log("Created driving_authorizations table");

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_da_employee ON driving_authorizations(employee_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_da_expiration ON driving_authorizations(expiration_date)`);
    console.log("Created driving_authorizations indexes");
  } else {
    console.log("driving_authorizations table already exists");
  }

  // Create online_trainings table if not exists
  if (!tableNames.includes("online_trainings")) {
    console.log("Creating online_trainings table...");
    await db.execute(`
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
    console.log("Created online_trainings table");

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_ot_employee ON online_trainings(employee_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_ot_expiration ON online_trainings(expiration_date)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_ot_status ON online_trainings(status)`);
    console.log("Created online_trainings indexes");
  } else {
    console.log("online_trainings table already exists");
  }

  console.log("Migration completed!");
}

main().catch(console.error);

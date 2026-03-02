const { getDb } = require("./src/core/db");

async function checkIndexes() {
  const db = getDb();

  // Get all indexes
  const indexes = await db.select({
    name: 1,
    sql: 1,
  }).from("sqlite_master").where({ type: "index", sql: { not: null } });

  console.log("=== INDEXES ===");
  for (const idx of indexes) {
    console.log(idx.name, "->", idx.sql);
  }

  // Get all tables
  const tables = await db.select({
    name: 1,
    sql: 1,
  }).from("sqlite_master").where({ type: "table", name: { not: "sqlite_sequence" } });

  console.log("\n=== TABLES ===");
  for (const t of tables) {
    console.log(t.name);
  }
}

checkIndexes().catch(console.error);

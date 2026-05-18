const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.db');
const db = new Database(dbPath);

console.log('Adding contract_type_id column to employees table...');

try {
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(employees)").all();
  const hasContractTypeId = tableInfo.some(col => col.name === 'contract_type_id');

  if (hasContractTypeId) {
    console.log('contract_type_id column already exists');
  } else {
    db.exec('ALTER TABLE employees ADD COLUMN contract_type_id INTEGER REFERENCES contract_types(id) ON DELETE SET NULL');
    console.log('Successfully added contract_type_id column');
  }
} catch (error) {
  console.error('Error:', error.message);
}

db.close();
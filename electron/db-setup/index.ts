import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'node:path'

// Simple database path - in project root for now
const dbPath = path.join(process.cwd(), 'data.db')

const sqlite = new Database(dbPath)

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

export const db = drizzle({
  schema,
  client: sqlite,
})

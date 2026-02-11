import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('./data.db')

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

export const db = drizzle({
  schema,
  client: sqlite,
})

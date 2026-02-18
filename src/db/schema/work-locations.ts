import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { timestamps } from './columns.helpers';

export const workLocations = sqliteTable('work_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // ex: "SITE_PARIS", "SITE_LYON"
  name: text('name').notNull(), // ex: "Site Paris", "Site Lyon"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Reusable timestamp columns
  ...timestamps,
});

// Type inference
export type WorkLocation = typeof workLocations.$inferSelect;
export type NewWorkLocation = typeof workLocations.$inferInsert;

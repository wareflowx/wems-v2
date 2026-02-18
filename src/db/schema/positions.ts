import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { timestamps } from './columns.helpers';

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // ex: "TECHNICIAN", "OPERATOR"
  name: text('name').notNull(), // ex: "Technicien", "Opérateur"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Reusable timestamp columns
  ...timestamps,
});

// Type inference
export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

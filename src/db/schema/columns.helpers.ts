import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Reusable timestamp columns for all tables
 * Includes created_at and updated_at
 */
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
};

/**
 * Timestamp columns with soft delete support
 * Use this for tables that need soft delete functionality
 */
export const timestampsWithSoftDelete = {
  ...timestamps,
  deletedAt: text('deleted_at'), // Nullable, for soft deletes
};

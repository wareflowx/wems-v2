import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";

/**
 * Agencies table - External employers/agencies for temporary workers
 * Example: " Interim Solutions", "Manpower", "Adecco"
 */
export const agencies = sqliteTable("agencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestampsWithSoftDelete,
});

// Type inference
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;

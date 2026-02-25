import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

/**
 * Departments table - Organizational units
 * Example: Production, Administration, RH, Commercial, Maintenance
 */
export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Type inference
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

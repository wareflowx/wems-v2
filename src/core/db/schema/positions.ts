import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";

export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // ex: "TECHNICIAN", "OPERATOR"
  name: text("name").notNull(), // ex: "Technicien", "Opérateur"
  color: text("color").notNull(), // ex: "bg-emerald-500", "bg-amber-500"
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

  // Reusable timestamp columns with soft delete
  ...timestampsWithSoftDelete,
});

// Type inference
export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

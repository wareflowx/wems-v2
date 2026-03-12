import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";

export interface NoteBadge {
  name: string;
  color: string;
}

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: integer("isCompleted", { mode: "boolean" }).default(false),
  badges: text("badges").default("[]"),
  ...timestampsWithSoftDelete,
});

// Type inference
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

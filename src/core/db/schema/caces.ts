import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { employees } from "./employees";
import { attachments } from "./attachments";

export const caces = sqliteTable("caces", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Employee reference (FK)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  // CACES details
  category: text("category").notNull(), // "1A", "1B", "2", "3", "4", "5", "6", "7", "8", "9"
  dateObtained: text("date_obtained").notNull(),
  expirationDate: text("expiration_date").notNull(),

  // Attachment (certificate document)
  attachmentId: text("attachment_id").references(() => attachments.id, {
    onDelete: "set null",
  }),

  // Reusable timestamp columns
  ...timestamps,
});

// Type inference
export type Cace = typeof caces.$inferSelect;
export type NewCace = typeof caces.$inferInsert;

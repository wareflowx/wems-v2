import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";
import { employees } from "./employees";
import { attachments } from "./attachments";

export const onlineTrainings = sqliteTable("online_trainings", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Employee reference (FK)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  // Training details
  trainingName: text("training_name").notNull(),
  trainingProvider: text("training_provider").notNull(), // Platform name (e.g., "Udemy", "LinkedIn Learning", "Formateur")
  completionDate: text("completion_date").notNull(),
  expirationDate: text("expiration_date"), // Optional - for certifications that expire

  // Status
  status: text("status").notNull().default("completed"), // "in_progress", "completed", "expired"

  // Attachment (certificate)
  attachmentId: text("attachment_id").references(() => attachments.id, {
    onDelete: "set null",
  }),

  // Reusable timestamp columns with soft delete
  ...timestampsWithSoftDelete,
});

// Type inference
export type OnlineTraining = typeof onlineTrainings.$inferSelect;
export type NewOnlineTraining = typeof onlineTrainings.$inferInsert;

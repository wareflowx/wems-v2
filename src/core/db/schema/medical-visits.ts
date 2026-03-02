import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";
import { employees } from "./employees";
import { attachments } from "./attachments";

export const medicalVisits = sqliteTable("medical_visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Employee reference (FK)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  // Medical visit details
  type: text("type").notNull(), // "periodique", "reprise", "initiale", "embauche"
  scheduledDate: text("scheduled_date").notNull(),
  actualDate: text("actual_date"), // null if not yet completed
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "overdue", "cancelled"
  fitnessStatus: text("fitness_status"), // "Apt", "Apt partiel", "Inapte" - only when completed

  // Attachment (medical certificate document)
  attachmentId: text("attachment_id").references(() => attachments.id, {
    onDelete: "set null",
  }),

  // Reusable timestamp columns with soft delete
  ...timestampsWithSoftDelete,
});

// Type inference
export type MedicalVisit = typeof medicalVisits.$inferSelect;
export type NewMedicalVisit = typeof medicalVisits.$inferInsert;

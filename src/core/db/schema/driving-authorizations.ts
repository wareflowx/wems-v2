import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";
import { employees } from "./employees";
import { attachments } from "./attachments";

export const drivingAuthorizations = sqliteTable("driving_authorizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Employee reference (FK)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  // License details
  licenseCategory: text("license_category").notNull(), // "B", "C", "D", "BE", "CE", "DE", etc.
  dateObtained: text("date_obtained").notNull(),
  expirationDate: text("expiration_date").notNull(),

  // Attachment (license scan)
  attachmentId: text("attachment_id").references(() => attachments.id, {
    onDelete: "set null",
  }),

  // Reusable timestamp columns with soft delete
  ...timestampsWithSoftDelete,
});

// Type inference
export type DrivingAuthorization = typeof drivingAuthorizations.$inferSelect;
export type NewDrivingAuthorization = typeof drivingAuthorizations.$inferInsert;

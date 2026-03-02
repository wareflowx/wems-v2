import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";
import { employees } from "./employees";

export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Employee reference (FK)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),

  // Contract details
  contractType: text("contract_type").notNull(), // "CDI", "CDD", "Intérim", "Alternance"
  startDate: text("start_date").notNull(),
  endDate: text("end_date"), // null for CDI

  // Status
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

  // Reusable timestamp columns with soft delete
  ...timestampsWithSoftDelete,
});

// Type inference
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(), // Always 1 (singleton)

  // Backup
  autoBackup: integer("auto_backup", { mode: "boolean" }).notNull().default(false),

  // Alerts
  cacesAlerts: integer("caces_alerts", { mode: "boolean" }).notNull().default(true),
  cacesDays: integer("caces_days").notNull().default(30),
  medicalAlerts: integer("medical_alerts", { mode: "boolean" }).notNull().default(true),
  medicalDays: integer("medical_days").notNull().default(7),
  contractAlerts: integer("contract_alerts", { mode: "boolean" }).notNull().default(false),

  // System
  theme: text("theme").notNull().default("system"),
  language: text("language").notNull().default("fr"),
  readOnlyMode: integer("read_only_mode", { mode: "boolean" }).notNull().default(false),

  ...timestamps,
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

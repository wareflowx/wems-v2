import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";

/**
 * Contract types table - Employment contract types
 * Example: CDI, CDD, Interim, Alternance
 */
export const contractTypes = sqliteTable("contract_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  color: text("color").notNull(), // ex: "bg-emerald-500", "bg-amber-500"
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestampsWithSoftDelete,
});

// Type inference
export type ContractType = typeof contractTypes.$inferSelect;
export type NewContractType = typeof contractTypes.$inferInsert;

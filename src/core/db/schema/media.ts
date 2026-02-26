import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

/**
 * Media table - Generic documents not tied to any employee
 * Use for: company logos, templates, HR policies, company documents
 */
export const media = sqliteTable("media", {
  id: text("id").primaryKey(), // UUID

  name: text("name").notNull(),
  type: text("type").notNull(), // 'logo', 'template', 'document', 'other'

  fileName: text("file_name"),
  mimeType: text("mime_type"),
  size: integer("size"),

  filePath: text("file_path"), // Relative path from data/files/media/

  ...timestamps,
});

// Type inference
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

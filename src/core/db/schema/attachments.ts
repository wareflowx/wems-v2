import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { employees } from "./employees";

/**
 * Attachments table - Employee-specific documents
 * Use for: contracts, CACES certificates, medical visits, personal documents
 */
export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(), // UUID

  employeeId: integer("employee_id").references(() => employees.id),

  entityType: text("entity_type").notNull(), // 'contract', 'caces', 'document', 'medical_visit'
  entityId: integer("entity_id"), // FK to respective entity

  originalName: text("original_name"),
  storedName: text("stored_name"), // UUID-based filename
  mimeType: text("mime_type"),
  size: integer("size"),

  filePath: text("file_path"), // Relative path from data/files/{entityType}/

  ...timestamps,
});

// Type inference
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

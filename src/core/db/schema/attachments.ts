import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { employees } from "./employees";

/**
 * Attachments table - Employee-specific documents
 * Use for: contracts, CACES certificates, medical visits, personal documents
 */
export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(), // UUID

  // Employee reference (FK)
  employeeId: integer("employee_id").references(() => employees.id, {
    onDelete: "cascade",
  }),

  // Entity this attachment belongs to
  entityType: text("entity_type").notNull(), // 'contract', 'caces', 'document', 'medical_visit'
  entityId: integer("entity_id"), // FK to respective entity (caces.id, etc.)

  // File info
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(), // UUID-based filename to prevent collisions
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // Size in bytes
  filePath: text("file_path").notNull(), // Relative path from data/files/{entityType}/

  ...timestamps,
});

// Type inference
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

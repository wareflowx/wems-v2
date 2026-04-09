-- Migration: Create media table
-- Media table: Generic documents not tied to any employee
-- Use for: company logos, templates, HR policies, company documents

CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    file_name TEXT,
    mime_type TEXT,
    size INTEGER,
    file_path TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_media_deleted_at ON media(deleted_at);
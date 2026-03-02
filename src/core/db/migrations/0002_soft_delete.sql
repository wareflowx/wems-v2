-- Migration: Add soft delete columns
-- Date: 2026-03-02
-- Description: Add deleted_at and deleted_by columns to support soft delete

-- Add columns to posts table (it didn't have timestamps before)
ALTER TABLE posts ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'));
ALTER TABLE posts ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));
ALTER TABLE posts ADD COLUMN deleted_at TEXT;
ALTER TABLE posts ADD COLUMN deleted_by TEXT;

-- Add soft delete columns to existing tables
ALTER TABLE positions ADD COLUMN deleted_at TEXT;
ALTER TABLE positions ADD COLUMN deleted_by TEXT;

ALTER TABLE work_locations ADD COLUMN deleted_at TEXT;
ALTER TABLE work_locations ADD COLUMN deleted_by TEXT;

ALTER TABLE employees ADD COLUMN deleted_at TEXT;
ALTER TABLE employees ADD COLUMN deleted_by TEXT;

ALTER TABLE contracts ADD COLUMN deleted_at TEXT;
ALTER TABLE contracts ADD COLUMN deleted_by TEXT;

ALTER TABLE contract_types ADD COLUMN deleted_at TEXT;
ALTER TABLE contract_types ADD COLUMN deleted_by TEXT;

ALTER TABLE departments ADD COLUMN deleted_at TEXT;
ALTER TABLE departments ADD COLUMN deleted_by TEXT;

ALTER TABLE media ADD COLUMN deleted_at TEXT;
ALTER TABLE media ADD COLUMN deleted_by TEXT;

ALTER TABLE attachments ADD COLUMN deleted_at TEXT;
ALTER TABLE attachments ADD COLUMN deleted_by TEXT;

ALTER TABLE caces ADD COLUMN deleted_at TEXT;
ALTER TABLE caces ADD COLUMN deleted_by TEXT;

ALTER TABLE medical_visits ADD COLUMN deleted_at TEXT;
ALTER TABLE medical_visits ADD COLUMN deleted_by TEXT;

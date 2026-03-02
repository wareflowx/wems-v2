-- Migration: Add driving authorizations and online trainings tables
-- Date: 2026-03-02

-- Create driving_authorizations table
CREATE TABLE IF NOT EXISTS driving_authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    license_category TEXT NOT NULL,
    date_obtained TEXT NOT NULL,
    expiration_date TEXT NOT NULL,
    attachment_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    deleted_by TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE SET NULL
);

-- Create indexes for driving_authorizations
CREATE INDEX IF NOT EXISTS idx_da_employee ON driving_authorizations(employee_id);
CREATE INDEX IF NOT EXISTS idx_da_expiration ON driving_authorizations(expiration_date);

-- Create online_trainings table
CREATE TABLE IF NOT EXISTS online_trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    training_name TEXT NOT NULL,
    training_provider TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    expiration_date TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    attachment_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    deleted_by TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE SET NULL
);

-- Create indexes for online_trainings
CREATE INDEX IF NOT EXISTS idx_ot_employee ON online_trainings(employee_id);
CREATE INDEX IF NOT EXISTS idx_ot_expiration ON online_trainings(expiration_date);
CREATE INDEX IF NOT EXISTS idx_ot_status ON online_trainings(status);

-- Add agencies table
CREATE TABLE IF NOT EXISTS `agencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
-- Create settings table if not exists
CREATE TABLE IF NOT EXISTS `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`auto_backup` integer DEFAULT false NOT NULL,
	`caces_alerts` integer DEFAULT true NOT NULL,
	`caces_days` integer DEFAULT 30 NOT NULL,
	`medical_alerts` integer DEFAULT true NOT NULL,
	`medical_days` integer DEFAULT 7 NOT NULL,
	`contract_alerts` integer DEFAULT false NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`language` text DEFAULT 'fr' NOT NULL,
	`read_only_mode` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- Add company_name to settings
ALTER TABLE `settings` ADD `company_name` text;
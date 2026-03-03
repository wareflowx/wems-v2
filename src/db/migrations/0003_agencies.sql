-- Add agencies table
CREATE TABLE IF NOT EXISTS `agencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
-- Add agency_id to employees
ALTER TABLE `employees` ADD `agency_id` integer;
--> statement-breakpoint
ALTER TABLE `employees` ADD FOREIGN KEY (`agency_id`) REFERENCES `agencies`(`id`) ON UPDATE no action ON DELETE set null;
--> statement-breakpoint
-- Add company_name to settings
ALTER TABLE `settings` ADD `company_name` text;

CREATE TABLE `settings` (
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
INSERT INTO `settings` (`id`) VALUES (1);

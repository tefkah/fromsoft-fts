CREATE TABLE `dialogue_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `dialogue_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dialogue_lines_fts` (
	`text` text
);
--> statement-breakpoint
CREATE TABLE `dialogue_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`dialogue_id` text NOT NULL,
	`section_id` text NOT NULL,
	FOREIGN KEY (`dialogue_id`) REFERENCES `dialogues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dialogues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`npc_id` text NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items_fts` (
	`title` text,
	`description` text
);

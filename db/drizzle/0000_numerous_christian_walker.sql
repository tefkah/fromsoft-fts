CREATE TABLE `dialogue_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_id` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `dialogue_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dialogue_lines_fts` (
	`text` text
);
--> statement-breakpoint
CREATE TABLE `dialogue_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dialogue_id` integer NOT NULL,
	`section_id` text NOT NULL,
	FOREIGN KEY (`dialogue_id`) REFERENCES `dialogues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dialogues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`npc_id` text NOT NULL,
	`name` text,
	`game_id` integer NOT NULL,
	`expansion_id` integer,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expansion_id`) REFERENCES `expansions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expansions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`game_id` integer NOT NULL,
	`expansion_id` integer,
	`type` text,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expansion_id`) REFERENCES `expansions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items_fts` (
	`title` text,
	`description` text
);

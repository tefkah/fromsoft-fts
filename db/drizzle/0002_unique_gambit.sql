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
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dialogue_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_id` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `dialogue_sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_dialogue_lines`("id", "section_id", "text") SELECT CAST("id" AS INTEGER), "section_id", "text" FROM `dialogue_lines`;--> statement-breakpoint
DROP TABLE `dialogue_lines`;--> statement-breakpoint
ALTER TABLE `__new_dialogue_lines` RENAME TO `dialogue_lines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `dialogues` ADD `game_id` integer REFERENCES games(id);--> statement-breakpoint
ALTER TABLE `dialogues` ADD `expansion_id` integer REFERENCES expansions(id);--> statement-breakpoint
ALTER TABLE `items` ADD `game_id` integer REFERENCES games(id);--> statement-breakpoint
ALTER TABLE `items` ADD `expansion_id` integer REFERENCES expansions(id);


-- set game_id to not null
ALTER TABLE `items` ALTER COLUMN `game_id` SET NOT NULL;
ALTER TABLE `dialogues` ALTER COLUMN `game_id` SET NOT NULL;

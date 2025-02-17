ALTER TABLE `dialogue_lines` ADD `original` text;--> statement-breakpoint
ALTER TABLE `dialogue_lines` ADD `used` integer DEFAULT true NOT NULL;
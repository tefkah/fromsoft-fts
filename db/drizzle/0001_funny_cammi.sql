PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dialogue_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dialogue_id` integer NOT NULL,
	`section_id` text NOT NULL,
	FOREIGN KEY (`dialogue_id`) REFERENCES `dialogues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_dialogue_sections`("id", "dialogue_id", "section_id") SELECT "id", "dialogue_id", "section_id" FROM `dialogue_sections`;--> statement-breakpoint
DROP TABLE `dialogue_sections`;--> statement-breakpoint
ALTER TABLE `__new_dialogue_sections` RENAME TO `dialogue_sections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "item_id", "title", "description") SELECT "id", "item_id", "title", "description" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;

    CREATE VIRTUAL TABLE items_fts USING fts5(
      title, 
      description
    );
  

  
    CREATE VIRTUAL TABLE dialogue_lines_fts USING fts5(
      text
    );
  

  
    INSERT INTO items_fts (rowid, title, description)
    SELECT id, title, description FROM items;
  

  
    INSERT INTO dialogue_lines_fts (rowid, text)
    SELECT id, text FROM dialogue_lines;
  

  
    CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
      INSERT INTO items_fts(rowid, title, description)
      VALUES (new.id, new.title, new.description);
    END;
  

  
    CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
      DELETE FROM items_fts WHERE rowid = old.id;
    END;
  

  
    CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
      UPDATE items_fts 
      SET title = new.title, 
          description = new.description 
      WHERE rowid = old.id;
    END;
  

  
    CREATE TRIGGER IF NOT EXISTS dialogue_lines_ai AFTER INSERT ON dialogue_lines BEGIN
      INSERT INTO dialogue_lines_fts(rowid, text)
      VALUES (new.id, new.text);
    END;
  

  
    CREATE TRIGGER IF NOT EXISTS dialogue_lines_ad AFTER DELETE ON dialogue_lines BEGIN
      DELETE FROM dialogue_lines_fts WHERE rowid = old.id;
    END;
  

  
    CREATE TRIGGER IF NOT EXISTS dialogue_lines_au AFTER UPDATE ON dialogue_lines BEGIN
      UPDATE dialogue_lines_fts 
      SET text = new.text 
      WHERE rowid = old.id;
    END;
  

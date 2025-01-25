import { sql } from 'drizzle-orm';
import { db as dab } from './index.js';

export async function setupFTS(db = dab) {
  //   // Drop existing FTS tables and triggers if they exist
  //   await db.run(sql`DROP TABLE IF EXISTS items_fts`);
  //   await db.run(sql`DROP TABLE IF EXISTS dialogue_lines_fts`);

  //   // Create FTS tables
  //   await db.run(sql`
  //     CREATE VIRTUAL TABLE items_fts USING fts5(
  //       title,
  //       description
  //     );
  //   `);

  //   await db.run(sql`
  //     CREATE VIRTUAL TABLE dialogue_lines_fts USING fts5(
  //       text
  //     );
  //   `);

  //   // Insert existing data into FTS tables
  //   await db.run(sql`
  //     INSERT INTO items_fts (rowid, title, description)
  //     SELECT id, title, description FROM items;
  //   `);

  //   await db.run(sql`
  //     INSERT INTO dialogue_lines_fts (rowid, text)
  //     SELECT id, text FROM dialogue_lines;
  //   `);

  //   // Create triggers to keep FTS in sync
  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
  //       INSERT INTO items_fts(rowid, title, description)
  //       VALUES (new.id, new.title, new.description);
  //     END;
  //   `);

  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
  //       DELETE FROM items_fts WHERE rowid = old.id;
  //     END;
  //   `);

  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
  //       UPDATE items_fts
  //       SET title = new.title,
  //           description = new.description
  //       WHERE rowid = old.id;
  //     END;
  //   `);

  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS dialogue_lines_ai AFTER INSERT ON dialogue_lines BEGIN
  //       INSERT INTO dialogue_lines_fts(rowid, text)
  //       VALUES (new.id, new.text);
  //     END;
  //   `);

  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS dialogue_lines_ad AFTER DELETE ON dialogue_lines BEGIN
  //       DELETE FROM dialogue_lines_fts WHERE rowid = old.id;
  //     END;
  //   `);

  //   await db.run(sql`
  //     CREATE TRIGGER IF NOT EXISTS dialogue_lines_au AFTER UPDATE ON dialogue_lines BEGIN
  //       UPDATE dialogue_lines_fts
  //       SET text = new.text
  //       WHERE rowid = old.id;
  //     END;
  //   `);

  await db.run(sql`DROP TABLE IF EXISTS search_fts`);

  // Create single FTS table for all searchable content
  await db.run(sql`
  CREATE VIRTUAL TABLE search_fts USING fts5(
    type,      -- 'item' or 'dialogue'
    id,        -- original table id
    title,     -- item title or NPC name
    content,   -- item description or dialogue text
    npc_id     -- null for items, npc_id for dialogue
  );
`);

  // Insert existing items
  await db.run(sql`
  INSERT INTO search_fts (type, id, title, content, npc_id)
  SELECT 
    'item' as type,
    id,
    title,
    description as content,
    NULL as npc_id
  FROM items;
`);

  // Insert existing dialogue lines
  await db.run(sql`
  INSERT INTO search_fts (type, id, title, content, npc_id)
  SELECT 
    'dialogue' as type,
    dialogue_lines.id,
    dialogues.name as title,
    dialogue_lines.text as content,
    dialogues.npc_id
  FROM dialogue_lines
  JOIN dialogue_sections ON dialogue_lines.section_id = dialogue_sections.id
  JOIN dialogues ON dialogue_sections.dialogue_id = dialogues.id;
`);

  // Create triggers for items
  await db.run(sql`
  CREATE TRIGGER items_ai AFTER INSERT ON items BEGIN
    INSERT INTO search_fts(type, id, title, content, npc_id)
    VALUES ('item', new.id, new.title, new.description, NULL);
  END;
`);

  await db.run(sql`
  CREATE TRIGGER items_ad AFTER DELETE ON items BEGIN
    DELETE FROM search_fts WHERE type = 'item' AND id = old.id;
  END;
`);

  await db.run(sql`
  CREATE TRIGGER items_au AFTER UPDATE ON items BEGIN
    UPDATE search_fts 
    SET title = new.title,
        content = new.description
    WHERE type = 'item' AND id = old.id;
  END;
`);

  // Create triggers for dialogue lines
  await db.run(sql`
  CREATE TRIGGER dialogue_lines_ai AFTER INSERT ON dialogue_lines BEGIN
    INSERT INTO search_fts(type, id, title, content, npc_id)
    SELECT 
      'dialogue',
      new.id,
      dialogues.name,
      new.text,
      dialogues.npc_id
    FROM dialogue_sections
    JOIN dialogues ON dialogue_sections.dialogue_id = dialogues.id
    WHERE dialogue_sections.id = new.section_id;
  END;
`);

  await db.run(sql`
  CREATE TRIGGER dialogue_lines_ad AFTER DELETE ON dialogue_lines BEGIN
    DELETE FROM search_fts WHERE type = 'dialogue' AND id = old.id;
  END;
`);

  await db.run(sql`
  CREATE TRIGGER dialogue_lines_au AFTER UPDATE ON dialogue_lines BEGIN
    UPDATE search_fts 
    SET content = new.text
    WHERE type = 'dialogue' AND id = old.id;
  END;
`);
}

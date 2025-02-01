import type { sql as drizzleSql } from 'drizzle-orm';

export function setupFTS<
  S extends
    | typeof drizzleSql
    | ((
        queryTemplate: TemplateStringsArray,
        ...params: unknown[]
      ) => {
        sql: string;
        params: unknown[];
      }),
>(sql: S): ReturnType<S>[] {
  const statements = [
    sql`DROP TABLE IF EXISTS search_fts;`,

    // Create single FTS table for all searchable content
    sql`CREATE VIRTUAL TABLE search_fts USING fts5(
    type,      -- 'item' or 'dialogue'
    id,        -- original table id
    title,     -- item title or NPC name
    content,   -- item description or dialogue text
    npc_id     -- null for items, npc_id for dialogue
  );`,

    // Insert existing items
    sql`INSERT INTO search_fts (type, id, title, content, npc_id)
  SELECT 
    'item' as type,
    id,
    title,
    description as content,
    NULL as npc_id
  FROM items;`,

    // Insert existing dialogue lines
    sql`INSERT INTO search_fts (type, id, title, content, npc_id)
  SELECT 
    'dialogue' as type,
    dialogue_lines.id,
    dialogues.name as title,
    dialogue_lines.text as content,
    dialogues.npc_id
  FROM dialogue_lines
  JOIN dialogue_sections ON dialogue_lines.section_id = dialogue_sections.id
  JOIN dialogues ON dialogue_sections.dialogue_id = dialogues.id;`,

    // Create triggers for items
    sql`CREATE TRIGGER items_ai AFTER INSERT ON items BEGIN
    INSERT INTO search_fts(type, id, title, content, npc_id)
    VALUES ('item', new.id, new.title, new.description, NULL);
  END;`,

    sql`CREATE TRIGGER items_ad AFTER DELETE ON items BEGIN
    DELETE FROM search_fts WHERE type = 'item' AND id = old.id;
  END;`,

    sql`CREATE TRIGGER items_au AFTER UPDATE ON items BEGIN
    UPDATE search_fts 
    SET title = new.title,
        content = new.description
    WHERE type = 'item' AND id = old.id;
  END;`,

    // Create triggers for dialogue lines
    sql`CREATE TRIGGER dialogue_lines_ai AFTER INSERT ON dialogue_lines BEGIN
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
  END;`,

    sql`CREATE TRIGGER dialogue_lines_ad AFTER DELETE ON dialogue_lines BEGIN
    DELETE FROM search_fts WHERE type = 'dialogue' AND id = old.id;
  END;`,

    sql`CREATE TRIGGER dialogue_lines_au AFTER UPDATE ON dialogue_lines BEGIN
    UPDATE search_fts 
    SET content = new.text
    WHERE type = 'dialogue' AND id = old.id;
  END;`,
  ];

  return statements as ReturnType<S>[];
}

-- Active: 1738950636211@@127.0.0.1@3306
SELECT
              search_fts.type as "type",
              search_fts.id as "id",
              highlight(search_fts, 2, '<mark>', '</mark>') as "title",
              highlight(search_fts, 3, '<mark>', '</mark>') as "content",
              search_fts.npc_id as "npcId",
              rank as "rank",
              items.type as "itemType",
              items.sub_type as "itemSubType",
              COALESCE(item_games.name, dialogue_games.name) as "game",
              COALESCE(item_expansions.name, dialogue_expansions.name) as "expansion"
            FROM search_fts
            LEFT JOIN (
              items
              INNER JOIN games as item_games ON items.game_id = item_games.id
              LEFT JOIN expansions as item_expansions ON items.expansion_id = item_expansions.id
            ) ON items.id = search_fts.id AND search_fts.type = 'item'
            LEFT JOIN (
              dialogue_lines
              INNER JOIN dialogue_sections ON dialogue_lines.section_id = dialogue_sections.id
              INNER JOIN dialogues ON dialogue_sections.dialogue_id = dialogues.id
              INNER JOIN games as dialogue_games ON dialogues.game_id = dialogue_games.id
              LEFT JOIN expansions as dialogue_expansions ON dialogues.expansion_id = dialogue_expansions.id
            ) ON dialogue_lines.id = search_fts.id AND search_fts.type = 'dialogue'
            WHERE search_fts MATCH '"eld" OR ("eld"*)'
            AND game = @gameName
            -- AND search_fts.type = ""
            -- AND items.type = ""
            -- AND items.sub_type LIKE "%rank"
            ORDER BY rank
            LIMIT 10; 
'Elden Ring'
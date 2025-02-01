import { sql } from 'drizzle-orm';
import { db } from './index.js';
import { Game } from './schema.js';
import { Expansion } from './schema.js';

// export const searchDialogue = async (term: string) => {
//   return db
//     .select()
//     .from(dialogueLinesFts)
//     .where(sql`text MATCH ${term}`);
// };

export async function searchDialogue(query: string, limit = 10) {
  const results = await db.all(sql`
    SELECT highlight(dialogue_lines_fts, 0, '<b>', '</b>') as text, dialogues.name, dialogues.npc_id
    FROM dialogue_lines_fts 
    JOIN dialogue_lines ON dialogue_lines.id = dialogue_lines_fts.rowid 
    JOIN dialogue_sections ON dialogue_sections.id = dialogue_lines.section_id
    JOIN dialogues ON dialogues.id = dialogue_sections.dialogue_id
    WHERE dialogue_lines_fts MATCH ${query}
    AND dialogues.name IS NOT NULL
    ORDER BY rank
    LIMIT ${limit + 1};
  `);

  if (results.length > limit) {
    return {
      results: results.slice(0, limit),
      more: true,
    };
  }

  return {
    results: results,
    more: false,
  };
}

type SearchResult = {
  type: 'item' | 'dialogue';
  id: string;
  title: string | null;
  content: string;
  npcId: string | null;
  rank: number;
  game: Game;
  expansion: Expansion;
  itemType: string | null;
};

export async function searchAll(
  query: string,
  {
    limit = 10,
    game,
    expansion,
    type,
    trx,
  }: {
    limit?: number;
    game?: Game;
    expansion?: Expansion;
    type?: 'item' | 'dialogue';
    trx: typeof db;
  } = {
    trx: db,
  }
) {
  // Clean the query by balancing quotes
  const cleanQuery = query.replace(/"/g, '').trim(); // Remove all quotes for the exact phrase
  const exactPhrase = `"${cleanQuery.toLowerCase()}"`;

  // For individual terms, handle quotes safely
  const fuzzyTerms =
    query
      .toLowerCase()
      .replace(/"([^"]*)$/g, '$1') // Remove trailing unmatched quote
      .match(/("[^"]+"|[^\s"]+)/g)
      ?.map((term) => {
        // Remove any remaining unbalanced quotes and trim
        term = term.replace(/"/g, '').trim();
        return `"${term}"*`;
      })
      .join(' OR ') || '';

  // Combine both with OR, but exact phrase comes first for ranking
  const searchTerms = `${exactPhrase} OR (${fuzzyTerms})`;

  const results = await trx.all<SearchResult>(sql`
    SELECT 
      search_fts.type,
      search_fts.id,
      highlight(search_fts, 2, '<mark>', '</mark>') as title,
      highlight(search_fts, 3, '<mark>', '</mark>') as content,
      search_fts.npc_id as npcId,
      rank,
      items.type as item_type,
      games.name as game,
      expansions.name as expansion
    FROM search_fts
    LEFT JOIN items ON items.id = search_fts.id AND search_fts.type = 'item'
    LEFT JOIN dialogues ON dialogues.id = search_fts.id AND search_fts.type = 'dialogue'
    INNER JOIN games ON games.id = items.game_id OR games.id = dialogues.game_id
    LEFT JOIN expansions ON expansions.id = items.expansion_id OR expansions.id = dialogues.expansion_id 
    WHERE search_fts MATCH ${searchTerms} 
    ${type ? sql`AND search_fts.type = ${type}` : sql``} ${
      game ? sql`AND games.name = ${game}` : sql``
    } ${expansion ? sql`AND expansions.name = ${expansion}` : sql``}
    ORDER BY rank
    LIMIT ${limit + 1};
  `);

  if (results.length > limit) {
    return {
      results: results.slice(0, limit),
      more: true,
    };
  }

  return {
    results: results,
    more: false,
  };
}

// Optional: Search with filters
export async function searchFiltered(
  query: string,
  options: {
    type?: 'item' | 'dialogue';
    limit?: number;
    trx: typeof db;
  } = {
    trx: db,
  }
) {
  const limit = options?.limit ?? 10;

  const typeFilter = options?.type ? sql`AND type = ${options.type}` : sql``;

  const results = await options.trx.all<SearchResult>(sql`
    SELECT 
      type,
      id,
      title,
      highlight(search_fts, 3, '<b>', '</b>') as content,
      npc_id as npcId,
      rank
    FROM search_fts
    WHERE search_fts MATCH ${query} ${typeFilter}
    ORDER BY rank
    LIMIT ${limit + 1};
  `);

  if (results.length > limit) {
    return {
      results: results.slice(0, limit),
      more: true,
    };
  }

  return {
    results: results,
    more: false,
  };
}

import { sql } from 'drizzle-orm';
import { db } from 'db/sqlocal.client.js';
import { Game, Expansion } from 'db/schema.js';

// export const searchDialogue = async (term: string) => {
//   return db
//     .select()
//     .from(dialogueLinesFts)
//     .where(sql`text MATCH ${term}`);
// };

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
  options: {
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

  const results = await options.trx.all<SearchResult>(sql`
    SELECT 
      search_fts.type as "type",
      search_fts.id as "id",
      highlight(search_fts, 2, '<mark>', '</mark>') as "title",
      highlight(search_fts, 3, '<mark>', '</mark>') as "content",
      search_fts.npc_id as "npcId",
      rank as "rank",
      items.type as "itemType",
      games.name as "game",
      expansions.name as "expansion"
    FROM search_fts
    LEFT JOIN items ON items.id = search_fts.id AND search_fts.type = 'item'
    LEFT JOIN dialogues ON dialogues.id = search_fts.id AND search_fts.type = 'dialogue'
    INNER JOIN games ON games.id = items.game_id OR games.id = dialogues.game_id
    LEFT JOIN expansions ON expansions.id = items.expansion_id OR expansions.id = dialogues.expansion_id 
    WHERE search_fts MATCH ${searchTerms} 
    ${options.type ? sql`AND search_fts.type = ${options.type}` : sql``} ${
      options.game ? sql`AND games.name = ${options.game}` : sql``
    } ${options.expansion ? sql`AND expansions.name = ${options.expansion}` : sql``}
    ORDER BY rank
    LIMIT ${options.limit ?? 10 + 1};
  `);

  if (results.length > (options.limit ?? 10)) {
    return {
      results: results.slice(0, options.limit ?? 10),
      more: true,
    };
  }

  return {
    results: results,
    more: false,
  };
}

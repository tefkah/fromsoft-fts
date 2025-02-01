import { useDeferredValue, useState } from 'react';
import {
  DatabaseProvider,
  useDbQuery,
} from '../components/DatabaseContext.client.js';

// export const meta: MetaFunction = () => {
//   return [
//     { title: 'Game Database Search' },
//     { name: 'description', content: 'Search items and dialogues from games' },
//   ];
// };

export default function IndexPage() {
  return (
    <DatabaseProvider>
      <Index />
    </DatabaseProvider>
  );
}
function SearchResults({ query }: { query: string }) {
  const { data: searchResults, isLoading } = useDbQuery(
    ['search', query],

    async ({ sql, db }) => {
      console.log('query', query);
      if (!query) {
        console.log('boob');
        return {
          results: [],
          more: false,
        };
      }

      const isExactQuery = /^"[^"]+"$/.test(query);

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
      const searchTerms = isExactQuery
        ? exactPhrase
        : `${exactPhrase} OR (${fuzzyTerms})`;

      console.log('searchTerms', searchTerms);

      const h = await db.query.items.findMany({
        limit: 10,
      });
      console.log('hey');

      console.log('hng', h);

      // const res =
      //   await sql`SELECT * from search_fts WHERE search_fts MATCH ${searchTerms} ORDER BY rank LIMIT 10`;

      const res = await sql`
    SELECT 
      search_fts.type as "type",
      search_fts.id as "id",
      highlight(search_fts, 2, '<mark>', '</mark>') as "title",
      highlight(search_fts, 3, '<mark>', '</mark>') as "content",
      search_fts.npc_id as "npcId",
      rank as "rank",
      items.type as "itemType",
      COALESCE(item_games.name, dialogue_games.name) as "game",
      COALESCE(item_expansions.name, dialogue_expansions.name) as "expansion"
    FROM search_fts
    LEFT JOIN (
      items 
      INNER JOIN games as item_games ON items.game_id = item_games.id
      LEFT JOIN expansions as item_expansions ON items.expansion_id = item_expansions.id
    ) ON items.id = search_fts.id AND search_fts.type = 'item'
    LEFT JOIN (
      dialogues 
      INNER JOIN games as dialogue_games ON dialogues.game_id = dialogue_games.id
      LEFT JOIN expansions as dialogue_expansions ON dialogues.expansion_id = dialogue_expansions.id
    ) ON dialogues.id = search_fts.id AND search_fts.type = 'dialogue'
    WHERE search_fts MATCH ${searchTerms}
    ORDER BY rank
    LIMIT 10;`;

      return {
        results: res,
        more: false,
      };
    },
    {
      // Don't fetch on empty query
      enabled: !!query,
      // Debounce searches
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      placeholderData: (prev) => prev,
    }
  );

  // Sync URL with search query
  // useEffect(() => {
  //   const searchParams = new URLSearchParams(window.location.search);
  //   setQuery(searchParams.get('q') || '');
  // }, []);

  // // Update URL when query changes
  // useEffect(() => {
  //   const newUrl = new URL(window.location.href);
  //   if (query) {
  //     newUrl.searchParams.set('q', query);
  //   } else {
  //     newUrl.searchParams.delete('q');
  //   }
  //   window.history.replaceState({}, '', newUrl);
  // }, [query]);

  const { results = [], more = false } = searchResults || {};

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={`${result.type}-${result.id}`}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm
               border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {result.type === 'item' ? (
                  <img
                    src={`/icons/icons/Armor_${result.title
                      ?.replace(':', '_')
                      .replace(/<[^>]*>?/gm, '')
                      .replace(/ /g, '_')}.png`}
                    alt={result.title}
                    className="w-6 h-6"
                  />
                ) : null}
                <span
                  className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 
                       text-blue-800 dark:text-blue-100"
                >
                  {result.type}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {result.game} • {result.expansion}
                </span>
              </div>
              <h2
                className="mt-1 text-lg font-medium text-gray-900 dark:text-white"
                dangerouslySetInnerHTML={{
                  __html: result.title || 'Untitled',
                }}
              />
              <p
                className="mt-1 text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
            </div>
          </div>
        </div>
      ))}

      {more && (
        <div className="text-center">
          <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400">
            Load more results...
          </button>
        </div>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}

function Index() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // Use React Query for search

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Game Database Search
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search through items and dialogues across games
          </p>
        </header>

        <div className="relative">
          <input
            type="search"
            value={query}
            placeholder="Search items or dialogues..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* {isLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent" />
            </div>
          )} */}
        </div>

        <SearchResults query={deferredQuery} />
      </div>
    </div>
  );
}

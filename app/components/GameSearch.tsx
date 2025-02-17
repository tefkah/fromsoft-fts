import { memo, useDeferredValue } from 'react';
import { useDbQuery } from './DatabaseContext.client.js';
import { useSearchParams } from '../hooks/useSearchParams.js';
import { useNavigate } from 'react-router';
import { filterConfig, type FilterValues } from '../config/filters.js';
import { ThemedSelect } from './ThemedSelect.js';
import { ThemedInput } from './ThemedInput.js';
import { sql } from 'kysely';
import { Game } from 'db/schema.js';

const ITEMS_PER_PAGE = 20;

type GameSearchProps = {
  game: Game;
  title: string;
  subtitle: string;
  allowGameChange?: boolean;
};

export function GameSearch({
  game,
  title,
  subtitle,
  allowGameChange = false,
}: GameSearchProps) {
  const [params, setParams] = useSearchParams<FilterValues>({
    query: '',
    page: '1',
    sortBy: 'relevance',
  });
  console.log('params', params);
  const deferredQuery = useDeferredValue(params.query);
  const navigate = useNavigate();

  const handleGameChange = (newGame: string) => {
    if (newGame === 'Elden Ring') {
      navigate('/eldenring');
    } else if (newGame === 'Bloodborne') {
      navigate('/bloodborne');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background transition-colors duration-300 font-serif">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <h1 className="text-5xl font-medieval tracking-wide text-foreground transition-colors duration-300">
            {title}
          </h1>
          <p className="font-medieval tracking-wide text-lg text-muted-foreground transition-colors duration-300">
            {subtitle}
          </p>
        </header>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allowGameChange && (
              <ThemedSelect
                value={params.game || ''}
                onChange={handleGameChange}
                options={filterConfig.games}
                placeholder="Select Game"
                label="Game"
              />
            )}
            <ThemedSelect
              value={params.contentType || ''}
              onChange={(value) => setParams({ contentType: value })}
              options={filterConfig.contentTypes}
              placeholder="Content Type"
              label="Content"
            />
            <ThemedSelect
              value={params.itemType || ''}
              onChange={(value) => setParams({ itemType: value })}
              options={filterConfig.itemTypes}
              placeholder="Item Type"
              label="Item Type"
            />
            {/* {params.itemType === 'weapon' && (
              <ThemedSelect
                value={params.weaponType || ''}
                onChange={(value) => setParams({ weaponType: value })}
                options={filterConfig.weaponTypes}
                placeholder="Weapon Type"
                label="Weapon Type"
              />
            )} */}
            <ThemedSelect
              value={params.sortBy || 'relevance'}
              onChange={(value) => setParams({ sortBy: value })}
              options={filterConfig.sortBy}
              placeholder="Sort By"
              label="Sort By"
              clearable={false}
            />
          </div>

          <ThemedInput
            type="search"
            value={params.query}
            placeholder="Search items or dialogues..."
            onChange={(e) => setParams({ query: e.target.value, page: '1' })}
          />
        </div>

        <SearchResults
          query={deferredQuery}
          game={game}
          filters={params}
          page={parseInt(params.page || '1')}
          onPageChange={(page) => setParams({ page: page.toString() })}
        />
      </div>
    </div>
  );
}

const SearchResults = memo(function SearchResults({
  query,
  game,
  filters,
  page,
  onPageChange,
}: {
  query: string;
  game: Game;
  filters: FilterValues;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data: searchResults, isLoading } = useDbQuery(
    ['search', query, game, filters, page],
    async ({ db, sql: sql2 }) => {
      if (!query && !filters.contentType && !filters.itemType) {
        return { results: [], more: false, total: 0 };
      }

      const offset = (page - 1) * ITEMS_PER_PAGE;
      const isExactQuery = /^"[^"]+"$/.test(query);
      const cleanQuery = query.replace(/"/g, '').trim();
      const exactPhrase = `"${cleanQuery.toLowerCase()}"`;
      const fuzzyTerms = query
        .toLowerCase()
        .replace(/"([^"]*)$/g, '$1')
        .match(/("[^"]+"|[^\s"]+)/g)
        ?.map((term) => {
          term = term.replace(/"/g, '').trim();
          return `"${term}"*`;
        })
        ?.join(' OR ');

      const searchTerms = isExactQuery
        ? `${exactPhrase}`
        : `${exactPhrase} OR (${fuzzyTerms})`;

      try {
        const conditions = [];
        if (query) conditions.push(sql`search_fts MATCH ${searchTerms}`);
        // Build ORDER BY clause

        const orderBy =
          filters.sortBy === 'name'
            ? sql`title`
            : filters.sortBy === 'type'
              ? sql`COALESCE(items.sub_type, items.type, search_fts.type), title`
              : sql`rank`;

        const whereClause = conditions.length
          ? sql`${sql.join(conditions, sql` AND `)}`
          : sql``;

        const searchQuery = db
          .selectFrom('search_fts')
          .leftJoin(
            (qb) =>
              qb
                .selectFrom('items')
                .selectAll()
                .innerJoin('games', 'items.game_id', 'games.id')
                .leftJoin('expansions', 'items.expansion_id', 'expansions.id')
                .select([
                  'items.id',
                  'item_id',
                  'items.title',
                  'items.description',
                  'items.type',
                  'items.sub_type',
                  'games.name as game',
                  'expansions.name as expansion',
                ])
                .as('full_items'),
            (join) => join.onRef('full_items.id', '=', 'search_fts.id')
          )
          .leftJoin(
            (qb) =>
              qb
                .selectFrom('dialogue_lines')
                .innerJoin(
                  'dialogue_sections',
                  'dialogue_lines.section_id',
                  'dialogue_sections.id'
                )
                .innerJoin(
                  'dialogues',
                  'dialogue_sections.dialogue_id',
                  'dialogues.id'
                )
                .innerJoin('games', 'dialogues.game_id', 'games.id')
                .leftJoin(
                  'expansions',
                  'dialogues.expansion_id',
                  'expansions.id'
                )
                .select([
                  'dialogue_lines.id',
                  'dialogue_lines.text',
                  'dialogue_lines.used',
                  'dialogues.npc_id',
                  'dialogues.name as title',
                  'games.name as game',
                  'expansions.name as expansion',
                ])
                // .where('dialogue_lines.id', '=', 'search_fts.id')
                .as('full_dialogue_lines'),
            (join) => join.onRef('full_dialogue_lines.id', '=', 'search_fts.id')
          )
          .select((eb) => [
            'search_fts.id',
            'search_fts.type',
            sql<string>`highlight(search_fts, 2, '<mark>', '</mark>')`.as(
              'title'
            ),
            sql<string>`highlight(search_fts, 3, '<mark>', '</mark>')`.as(
              'content'
            ),
            sql<string>`COALESCE(full_items.game, full_dialogue_lines.game)`.as(
              'game_name'
            ),
            sql<string>`COALESCE(full_items.expansion, full_dialogue_lines.expansion)`.as(
              'expansion_name'
            ),
            'full_items.sub_type as itemSubType',
            'full_items.type as itemType',
          ])
          // .where(whereClause)
          .where(sql`search_fts`, sql`match`, searchTerms)
          .$if(!!game, (q) => q.where('game_name', '=', game))
          .$if(!!filters.contentType, (q) =>
            q.where('search_fts.type', '=', filters.contentType!)
          )
          .$if(!!filters.itemType, (q) =>
            q.where('full_items.type', '=', filters.itemType!)
          )
          .$if(!!filters.weaponType, (q) =>
            q.where('full_items.sub_type', '=', filters.weaponType!)
          )
          .limit(10)
          .orderBy('rank');

        // console.log(searchQuery.compile().sql);
        const start = performance.now();
        const results = await searchQuery.execute();
        const end = performance.now();
        console.log(`Drizzle: Time taken: ${end - start} milliseconds`);
        console.log(results);
        return {
          results,
          more: false,
          total: 1000,
        };
      } catch (e) {
        console.error(e);
        return { results: [], more: false, total: 0 };
      }
    },
    {
      enabled: !!(query || filters.contentType || filters.itemType),
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      placeholderData: (prev) => prev,
    }
  );

  const { results = [], more = false, total = 0 } = searchResults || {};
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="text-center p-8 font-medieval text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div
          key={`${result.type}-${result.id}`}
          className="p-6 border transition-all duration-300 font-serif"
        >
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-medieval tracking-wider border">
                  {result.itemSubType
                    ? result.itemSubType === 'unknown'
                      ? result.itemType
                      : result.itemSubType
                    : result.type}
                </span>
                <span className="text-sm text-muted-foreground">
                  {result.game_name} • {result.expansion_name}
                </span>
              </div>
              <h2
                className="mt-2 text-xl font-medieval tracking-wide"
                dangerouslySetInnerHTML={{
                  __html: result.title || 'Untitled',
                }}
              />

              <div className="flex items-center gap-2">
                {result.type === 'item' && (
                  <div className="w-20 h-20 p-2 border">
                    {/* <img
                      src={`/icons/${
                        result.expansion ? '/Shadow of the Erdtree DLC/' : ''
                      }${itemLikeToFolderName(result)}/${result.title
                        ?.replace("'", '_')
                        ?.replace(':', '_')
                        .replace(/<[^>]*>?/gm, '')}.png`}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    /> */}
                  </div>
                )}
                <p
                  className="mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: result.content }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {more && (
        <div className="text-center">
          <button className="font-medieval tracking-wide transition-colors">
            Load more results...
          </button>
        </div>
      )}

      {query && results.length === 0 && !isLoading && (
        <div className="text-center font-medieval tracking-wide text-muted-foreground">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
});

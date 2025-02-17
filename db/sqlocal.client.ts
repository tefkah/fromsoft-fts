// import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { SQLocalKysely } from 'sqlocal/kysely';

import { Kyselify } from 'drizzle-orm/kysely';
// import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema.js';
// import { setupFTS } from './fts.js';
import { ColumnType, Kysely } from 'kysely';

export type DB = {
  games: Kyselify<typeof schema.games>;
  expansions: Kyselify<typeof schema.expansions>;
  items: Kyselify<typeof schema.items>;
  dialogues: Kyselify<typeof schema.dialogues>;
  dialogue_lines: Kyselify<typeof schema.dialogueLines>;
  dialogue_sections: Kyselify<typeof schema.dialogueSections>;
  search_fts: SearchFTSTable;
};

type SearchFTSTable = {
  id: ColumnType<number>;
  type: ColumnType<string>;
  title: ColumnType<string>;
  content: ColumnType<string>;
  npcId: ColumnType<number>;
  rank: ColumnType<number>;
};

const {
  overwriteDatabaseFile,
  dialect,
  getDatabaseFile,
  getDatabaseInfo,
  sql,
} = new SQLocalKysely({
  databasePath: 'sqlite.db',
  // verbose: true,

  // onInit: (sql) => {
  //   return setupFTS(sql);
  // },
});

// export const db = drizzle(driver, {
//   schema,
// });
export const db = new Kysely<DB>({
  dialect,
});

export { getDatabaseFile, getDatabaseInfo, sql, overwriteDatabaseFile };

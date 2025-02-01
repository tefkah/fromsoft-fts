import { SQLocalDrizzle } from 'sqlocal/drizzle';

import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema.js';
import { setupFTS } from './fts.js';

const { overwriteDatabaseFile, driver, getDatabaseFile, getDatabaseInfo, sql } =
  new SQLocalDrizzle({
    databasePath: 'sqlite.db',

    // onInit: (sql) => {
    //   return setupFTS(sql);
    // },
  });
export const db = drizzle(driver, { schema });

export { driver, getDatabaseFile, getDatabaseInfo, sql, overwriteDatabaseFile };

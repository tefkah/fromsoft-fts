import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import Database from 'better-sqlite3';
import { seed } from './seed.js';
import fs from 'fs';
import { setupFTS } from './fts.js';
import { generateJson } from 'assets/html-to-json.js';
import { sql } from 'drizzle-orm';

// delete the database
if (fs.existsSync('sqlite.db')) {
  fs.unlinkSync('sqlite.db');
}
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, {
  schema,
});
console.log('Migrating database');
await migrate(db, {
  migrationsFolder: new URL('./drizzle', import.meta.url).pathname,
});
console.log('✅ Database migrated');

console.log('Generating JSON');
// await generateJson();
console.log('✅ JSON generated');

console.log('Setting up FTS');
for (const statement of setupFTS(sql)) {
  await db.run(statement);
}
console.log('✅ FTS setup');

console.log('Seeding database');
try {
  await seed(db);
  console.log('✅ Database seeded');
} catch (e) {
  console.error(e);
  process.exit(1);
}

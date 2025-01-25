import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema.js';
import { Database } from 'bun:sqlite';
import { seed } from './seed.js';
import fs from 'fs';
import { setupFTS } from './fts.js';
import { generateJson } from 'assets/html-to-json.js';

// delete the database
fs.unlinkSync('sqlite.db');
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
await generateJson();
console.log('✅ JSON generated');

console.log('Seeding database');
await seed(db);
console.log('✅ Database seeded');

console.log('Setting up FTS');
await setupFTS(db);
console.log('✅ FTS setup');

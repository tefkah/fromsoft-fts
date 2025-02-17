import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const searchFts = sqliteTable('search_fts', {
  type: text('type'),
  id: text('id'),
  title: text('title'),
  content: text('content'),
  npc_id: text('npc_id'),
});

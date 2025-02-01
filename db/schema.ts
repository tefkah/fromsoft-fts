import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const GAMES = ['Elden Ring'] as const;
const ITEM_TYPES = [
  'armor',
  'accessory',
  'weapon',
  'consumable',
  'art',
  'ash',
] as const;

export type Game = (typeof GAMES)[number];
export type ItemType = (typeof ITEM_TYPES)[number];

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { enum: GAMES }).notNull(),
});

const EXPANSIONS = ['Shadow of the Erdtree'] as const;
export type Expansion = (typeof EXPANSIONS)[number];
export const expansions = sqliteTable('expansions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id),
  name: text('name', { enum: EXPANSIONS }).notNull(),
});

// Items table
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: text('item_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id),
  expansionId: integer('expansion_id').references(() => expansions.id),
  type: text('type'),
  // SQLite FTS virtual table will be created separately
});

// Dialogues table
export const dialogues = sqliteTable('dialogues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  npcId: text('npc_id').notNull(),
  name: text('name'),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id),
  expansionId: integer('expansion_id').references(() => expansions.id),
});

// Dialogue sections table
export const dialogueSections = sqliteTable('dialogue_sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dialogueId: integer('dialogue_id')
    .notNull()
    .references(() => dialogues.id),
  sectionId: text('section_id').notNull(), // e.g., "00", "50"
});

// Dialogue lines table
export const dialogueLines = sqliteTable('dialogue_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }), // e.g., "1090700000"
  sectionId: integer('section_id')
    .notNull()
    .references(() => dialogueSections.id),
  text: text('text').notNull(),
});

// Relations
export const dialogueRelations = relations(dialogues, ({ many }) => ({
  sections: many(dialogueSections),
}));

export const dialogueSectionRelations = relations(
  dialogueSections,
  ({ one, many }) => ({
    dialogue: one(dialogues, {
      fields: [dialogueSections.dialogueId],
      references: [dialogues.id],
    }),
    lines: many(dialogueLines),
  })
);

export const dialogueLineRelations = relations(dialogueLines, ({ one }) => ({
  section: one(dialogueSections, {
    fields: [dialogueLines.sectionId],
    references: [dialogueSections.id],
  }),
}));

// FTS (Full Text Search) virtual tables
export const itemsFts = sqliteTable('items_fts', {
  title: text('title'),
  description: text('description'),
});

export const dialogueLinesFts = sqliteTable('dialogue_lines_fts', {
  text: text('text'),
});

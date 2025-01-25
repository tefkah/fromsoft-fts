import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
} satisfies Config;

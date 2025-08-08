import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config();

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production');
}

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://app_user:password@localhost:5432/apprentice_db';

export default defineConfig({
  out: './migrations',
  schema: './shared/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle-db/migrations',
  schema: './drizzle-db/schema',
  dialect: 'sqlite',
  strict: true
});
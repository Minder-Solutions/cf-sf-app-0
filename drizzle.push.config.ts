import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle-db/migrations',
  schema: './drizzle-db/schema',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  // Only include specific tables in operations
  tablesFilter: ['example_table', 'subscription_tracking'],
  // Set strict mode to true to prevent automatic schema changes that could drop tables
  strict: true
});

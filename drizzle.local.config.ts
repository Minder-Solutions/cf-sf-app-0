import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle-db/migrations',
  schema: './drizzle-db/schema',
  dialect: 'sqlite',
  // driver: 'durable-sqlite',
  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6f963cf584dcee1884adc5f4b8cbfca606aaadccaa1bb14a5e264efadbae6488.sqlite'
  },
  tablesFilter: ['example_table', 'subscription_tracking'],
});
import { D1Database } from '@cloudflare/workers-types';

/**
 * Global database instance matching Wrangler binding
 */
declare global {
  var DB: D1Database | undefined;
}

/**
 * Creates all necessary tables for the application
 * Currently creates:
 * - shopify_sessions: Stores Shopify session data
 */
export async function createTables(db: D1Database): Promise<void> {
  try {
    // `CREATE TABLE IF NOT EXISTS` is efficient and safe to call repeatedly
    // The database engine will simply skip table creation if it already exists
    await db.exec(
      "CREATE TABLE IF NOT EXISTS shopify_sessions (id TEXT PRIMARY KEY, shop TEXT NOT NULL, state TEXT, isOnline INTEGER, scope TEXT, accessToken TEXT, expires INTEGER, onlineAccessInfo TEXT)"
    );
    
    console.log("Application tables initialized successfully");
  } catch (error) {
    console.error("Failed to create application tables:", error);
  }
}
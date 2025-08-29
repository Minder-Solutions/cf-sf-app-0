import { type PlatformProxy } from "wrangler";
import { createTables } from './app/database.server';
import { setKvNamespace } from './app/shopify.server';

/**
 * load-context.ts
 * 
 * This file is responsible for setting up the request context for the Remix app
 * in a Cloudflare Workers environment. It initializes the KV namespace for session
 * storage at the beginning of each request.
 * 
 * The context setup follows these key principles:
 * 1. Early initialization of KV namespace to ensure it's available for the entire request
 * 2. Graceful handling of missing bindings
 * 3. Minimal logging to reduce noise in production
 */

type GetLoadContextArgs = {
  request: Request;
  context: {
    cloudflare: Omit<PlatformProxy<Env>, "dispose" | "caches" | "cf"> & {
      caches: PlatformProxy<Env>["caches"] | CacheStorage;
      cf: Request["cf"];
    };
  };
};

declare module "@remix-run/cloudflare" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {
    // This will merge the result of `getLoadContext` into the `AppLoadContext`
  }
}

export function getLoadContext({ context }: GetLoadContextArgs) {
  // Initialize DB if available and not already initialized
  // if (context.cloudflare?.env?.DB && !globalThis.DB) {
  //   // Store the DB instance globally
  //   globalThis.DB = context.cloudflare.env.DB;
    
  //   // Create tables
  //   createTables(globalThis.DB).catch(console.error);
  // }
  
  /**
   * KV Namespace Initialization
   * 
   * Initialize the KV namespace for Shopify session storage at the beginning of each request.
   * This ensures that all Shopify operations within this request have access to the same
   * namespace for session data. The setKvNamespace function handles deduplication internally
   * through the shopifyNamespaceInitialized flag, so calling it multiple times is safe.
   */
  if (context.cloudflare?.env?.SESSIONS_KV) {
    // Only log in development or on first initialization
    // console.log("Setting SESSIONS_KV namespace");
    const kvNamespace = context.cloudflare.env.SESSIONS_KV;
    
    // Verify the KV namespace has the expected methods before setting
    if (typeof kvNamespace.get === 'function') {
      setKvNamespace(kvNamespace);
    } else {
      console.error("KV namespace appears invalid - missing get method");
    }
  } else {
    console.error("SESSIONS_KV not found in environment variables");
  }
  
  return context;
}
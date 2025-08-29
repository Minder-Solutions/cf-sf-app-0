import { type PlatformProxy } from "wrangler";
import { createTables } from './app/database.server';
import { setKvNamespace } from './app/shopify.server';

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
  
  // Initialize KV namespace for session storage if available
  if (context.cloudflare?.env?.SESSIONS_KV) {
    setKvNamespace(context.cloudflare.env.SESSIONS_KV);
  }
  
  return context;
}
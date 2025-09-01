import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { KVSessionStorage } from "@shopify/shopify-app-session-storage-kv";

/**
 * Shopify KV Session Storage Implementation
 * 
 * This module implements Shopify session storage using Cloudflare KV.
 * It's designed to work in a serverless environment where each request
 * gets a fresh execution context.
 * 
 * Key patterns:
 *  1. Initialize the session object before creating a Shopify app instance
 *  2. Store the session object in globalThis to persist between function calls
 */

// Define type for the global shopify app instance and session storage
declare global {
  var shopifyAppInstance: ReturnType<typeof shopifyApp> | undefined;
  var shopifySessionStorage: KVSessionStorage | undefined;
}


/**
 * Initialize the session storage by passing a reference to the binding for KV
 * It is called in the load context before the shopify app is initialized that is why it uses globalThis for a higher scope
 */
export const initKvSessionStorage = (kvNamespace: KVNamespace) => {
 if (!globalThis.shopifySessionStorage) {
    globalThis.shopifySessionStorage = new KVSessionStorage(kvNamespace);
  }
};


/**
 * Get or create a new Shopify app instance
 * 
 * This function implements a singleton pattern:
 * It returns an existing app instance if available and only when the session is initialized
 * The approach ensures we don't create unnecessary app instances while calling methods
 * 
 * @returns The Shopify app instance
 */
const getShopifyApp = () => {
  if (!globalThis.shopifySessionStorage) {
    throw new Error('The session was not initialized')
  }
  // Return existing instance if available and the session is initialized
  if (globalThis.shopifyAppInstance) {
    return globalThis.shopifyAppInstance;
  }

  const shopifyConfig = {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: process.env.SCOPES?.split(",") || [],
    appUrl: process.env.SHOPIFY_APP_URL || "",
    distribution: AppDistribution.AppStore,
    apiVersion: ApiVersion.July23,
    isEmbeddedApp: true,
    sessionStorage: globalThis.shopifySessionStorage,
    future: {
      unstable_newEmbeddedAuthStrategy: true,
    }
  };


  return (globalThis.shopifyAppInstance = shopifyApp(shopifyConfig));
};

export const apiVersion = ApiVersion.January25;

export const getSessionStorage = () => getShopifyApp().sessionStorage;

export const addDocumentResponseHeaders = (request: Request, headers: Headers) => getShopifyApp().addDocumentResponseHeaders(request, headers);

export const authenticate = {
  admin: (request: Request) => getShopifyApp().authenticate.admin(request),
  public: (request: Request) => getShopifyApp().authenticate.public(request),
  webhook: (request: Request) => getShopifyApp().authenticate.webhook(request)
};

export const unauthenticated = {
  admin: (request: Request) => getShopifyApp().unauthenticated.admin(request),
  public: (request: Request) => getShopifyApp().unauthenticated.public(request)
};

export const login = (request: Request) => getShopifyApp().login(request);

export const registerWebhooks = (request: Request) => getShopifyApp().registerWebhooks(request);
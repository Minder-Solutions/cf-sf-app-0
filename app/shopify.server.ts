import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { KVSessionStorage } from "@shopify/shopify-app-session-storage-kv";

// Define type for the global shopify app instance and session storage
declare global {
  var shopifyAppInstance: ReturnType<typeof shopifyApp> | undefined;
  var shopifyKvNamespace: KVNamespace | undefined;
  var shopifySessionStorage: KVSessionStorage | undefined;
}

// Initialize KV session storage globally to ensure it persists between requests
if (!globalThis.shopifySessionStorage) {
  globalThis.shopifySessionStorage = new KVSessionStorage();
  // console.log("Created global KVSessionStorage instance");
}

// Set the KV namespace for the session storage
export const setKvNamespace = (kvNamespace: KVNamespace) => {
  if (!kvNamespace) {
    console.error("No KV namespace provided to setKvNamespace");
    return;
  }

  // Store namespace globally
  globalThis.shopifyKvNamespace = kvNamespace;
  
  // Always use the global session storage instance
  if (!globalThis.shopifySessionStorage) {
    globalThis.shopifySessionStorage = new KVSessionStorage();
    // console.log("Created new global KVSessionStorage instance in setKvNamespace");
  }
  
  // Set the namespace
  globalThis.shopifySessionStorage.setNamespace(kvNamespace);
  
  // Reset the app instance to ensure it's created with the properly configured session storage
  globalThis.shopifyAppInstance = undefined;
  
  // console.log("KV namespace set for Shopify session storage");
};

// Function to get or create the Shopify app instance
function getShopifyApp() {
  // Ensure KV namespace is set
  if (!globalThis.shopifyKvNamespace) {
    console.error("KV namespace not initialized before app instantiation! This will cause session storage to fail.");
  }
  
  // Ensure session storage is set
  if (!globalThis.shopifySessionStorage) {
    console.error("Session storage not initialized!");
    globalThis.shopifySessionStorage = new KVSessionStorage();
    
    if (globalThis.shopifyKvNamespace) {
      globalThis.shopifySessionStorage.setNamespace(globalThis.shopifyKvNamespace);
      // console.log("Created and initialized new session storage with existing namespace");
    }
  }
  
  if (!globalThis.shopifyAppInstance) {
    // console.log("Creating new Shopify app instance");
    
    globalThis.shopifyAppInstance = shopifyApp({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.January25,
      scopes: process.env.SCOPES?.split(","),
      appUrl: process.env.SHOPIFY_APP_URL || "",
      authPathPrefix: "/auth",
      sessionStorage: globalThis.shopifySessionStorage,
      distribution: AppDistribution.AppStore,
      future: {
        unstable_newEmbeddedAuthStrategy: true,
        removeRest: true,
      },
      ...(process.env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    });
  }
  return globalThis.shopifyAppInstance;
}

export const apiVersion = ApiVersion.January25;

// Lazy-load the shopify app when these functions are called
export const addDocumentResponseHeaders = (response: Response, request: Request) => {
  return getShopifyApp().addDocumentResponseHeaders(response, request);
};

export const authenticate = {
  admin: (request: Request) => {
    return getShopifyApp().authenticate.admin(request);
  },
  public: (request: Request) => {
    return getShopifyApp().authenticate.public(request);
  },
  webhook: (request: Request) => {
    return getShopifyApp().authenticate.webhook(request);
  }
};

export const unauthenticated = {
  admin: (request: Request) => {
    return getShopifyApp().unauthenticated.admin(request);
  },
  public: (request: Request) => {
    return getShopifyApp().unauthenticated.public(request);
  }
};

export const login = (request: Request) => {
  return getShopifyApp().login(request);
};

export const registerWebhooks = (request: Request) => {
  return getShopifyApp().registerWebhooks(request);
};

export default {
  apiVersion,
  authenticate,
  unauthenticated,
  login,
  registerWebhooks,
  addDocumentResponseHeaders,
  setKvNamespace
};

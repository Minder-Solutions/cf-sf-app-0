import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { KVSessionStorage } from "@shopify/shopify-app-session-storage-kv";

// Define type for the global shopify app instance
declare global {
  var shopifyAppInstance: ReturnType<typeof shopifyApp> | undefined;
  var shopifyKvNamespace: KVNamespace | undefined;
}

// Create a KV session storage adapter
const sessionStorage = new KVSessionStorage();

// Function to get or create the Shopify app instance
function getShopifyApp() {
  if (!globalThis.shopifyAppInstance) {
    globalThis.shopifyAppInstance = shopifyApp({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.January25,
      scopes: process.env.SCOPES?.split(","),
      appUrl: process.env.SHOPIFY_APP_URL || "",
      authPathPrefix: "/auth",
      sessionStorage,
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

// Set the KV namespace for the session storage
export const setKvNamespace = (kvNamespace: KVNamespace) => {
  if (kvNamespace && !globalThis.shopifyKvNamespace) {
    globalThis.shopifyKvNamespace = kvNamespace;
    sessionStorage.setNamespace(kvNamespace);
    console.log("KV namespace set for Shopify session storage");
  }
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

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
 * 1. Store session storage and KV namespace in globalThis to persist between function calls
 * 2. Initialize KV namespace before creating the Shopify app instance
 * 3. Use a flag to track if namespace has been properly set
 * 4. Lazy initialization of the Shopify app instance
 */

// Define type for the global shopify app instance and session storage
declare global {
  var shopifyAppInstance: ReturnType<typeof shopifyApp> | undefined;
  var shopifyKvNamespace: KVNamespace | undefined;
  var shopifySessionStorage: KVSessionStorage | undefined;
  var shopifyNamespaceInitialized: boolean | undefined;
}

// Initialize KV session storage globally to ensure it persists between requests
if (!globalThis.shopifySessionStorage) {
  globalThis.shopifySessionStorage = new KVSessionStorage();
  // console.log("Created global KVSessionStorage instance");
}

/**
 * Sets the KV namespace for session storage
 * 
 * This function must be called before any Shopify app operations.
 * It configures the KV namespace that will be used for storing session data.
 * The function is idempotent and can be called multiple times without issues.
 */
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
  
  // Mark that the namespace has been initialized
  globalThis.shopifyNamespaceInitialized = true;
  
  // Reset the app instance to ensure it's created with the properly configured session storage
  globalThis.shopifyAppInstance = undefined;
  
  // console.log("KV namespace set for Shopify session storage");
};

// Function to get or create the Shopify app instance
/**
 * Get or create a new Shopify app instance
 * 
 * This function implements a singleton pattern with recovery mechanisms:
 * 1. Returns existing app instance if available and namespace is initialized
 * 2. Attempts recovery if namespace exists but isn't marked as initialized
 * 3. Creates a new instance if needed, with session storage
 * 4. Performs error checking and reporting at each step
 * 
 * The approach ensures we don't create unnecessary app instances while
 * providing robustness in the serverless environment.
 * 
 * @returns The Shopify app instance
 */
const getShopifyApp = () => {
  // Always ensure we have a KV namespace configured
  if (!globalThis.shopifyKvNamespace) {
    console.error("No KV namespace available for Shopify app. Was setKvNamespace called?");
  }

  // If namespace flag not set, try to recover if possible
  if (!globalThis.shopifyNamespaceInitialized && globalThis.shopifyKvNamespace) {
    console.warn("Namespace was not marked as initialized, but a namespace exists. Attempting to recover...");
    
    // Recover by setting the namespace again
    if (globalThis.shopifySessionStorage && globalThis.shopifyKvNamespace) {
      globalThis.shopifySessionStorage.setNamespace(globalThis.shopifyKvNamespace);
      globalThis.shopifyNamespaceInitialized = true;
      console.log("Recovery successful: Namespace re-initialized");
    }
  }
  
  // Return existing instance if available and namespace is properly initialized
  if (globalThis.shopifyAppInstance && globalThis.shopifyNamespaceInitialized) {
    return globalThis.shopifyAppInstance;
  }
  
  // Create a new app instance using the global session storage
  if (!globalThis.shopifySessionStorage) {
    console.error("No session storage available for Shopify app.");
    
    // Last-ditch recovery attempt if we have a namespace
    if (globalThis.shopifyKvNamespace) {
      console.warn("Creating new session storage as fallback...");
      globalThis.shopifySessionStorage = new KVSessionStorage();
      globalThis.shopifySessionStorage.setNamespace(globalThis.shopifyKvNamespace);
      globalThis.shopifyNamespaceInitialized = true;
    } else {
      // Critical failure - cannot continue without namespace
      throw new Error("Failed to initialize Shopify app: No KV namespace available");
    }
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

  // console.log("Creating new Shopify app instance");
  globalThis.shopifyAppInstance = shopifyApp(shopifyConfig);
  
  return globalThis.shopifyAppInstance;
};

// Getter for the current session storage instance
// Always get sessionStorage from the current app instance to ensure proper initialization
export const getSessionStorage = () => {
  return getShopifyApp().sessionStorage;
};

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

import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { D1Database } from "@cloudflare/workers-types";
import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

// Define type for the global shopify app instance
declare global {
  var shopifyAppInstance: ReturnType<typeof shopifyApp> | undefined;
}

// Create a D1 session storage adapter
class D1SessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    if (!globalThis.DB) {
      console.error("D1 database not initialized");
      return false;
    }

    try {
      await globalThis.DB.prepare(`
        INSERT OR REPLACE INTO shopify_sessions
        (id, shop, state, isOnline, scope, accessToken, expires, onlineAccessInfo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        session.id || null,
        session.shop || null,
        session.state || null,
        session.isOnline ? 1 : 0,
        session.scope || null,
        session.accessToken || null,
        session.expires ? session.expires.getTime() : null,
        session.onlineAccessInfo ? JSON.stringify(session.onlineAccessInfo) : null
      ).run();
      return true;
    } catch (error) {
      console.error("Failed to store session:", error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    if (!globalThis.DB) {
      console.error("D1 database not initialized");
      return undefined;
    }

    try {
      const result = await globalThis.DB.prepare(`
        SELECT * FROM shopify_sessions WHERE id = ?
      `).bind(id || null).first();
      
      if (!result) return undefined;
      
      const session = new Session({
        id: result.id as string,
        shop: result.shop as string,
        state: result.state as string,
        isOnline: Boolean(result.isOnline),
      });

      session.scope = result.scope as string;
      session.accessToken = result.accessToken as string;
      
      if (result.expires) {
        session.expires = new Date(result.expires as number);
      }
      
      if (result.onlineAccessInfo) {
        session.onlineAccessInfo = JSON.parse(result.onlineAccessInfo as string);
      }
      
      return session;
    } catch (error) {
      console.error("Failed to load session:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    if (!globalThis.DB) {
      console.error("D1 database not initialized");
      return false;
    }

    try {
      await globalThis.DB.prepare(`
        DELETE FROM shopify_sessions WHERE id = ?
      `).bind(id || null).run();
      return true;
    } catch (error) {
      console.error("Failed to delete session:", error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    if (!globalThis.DB) {
      console.error("D1 database not initialized");
      return false;
    }

    try {
      for (const id of ids) {
        await this.deleteSession(id);
      }
      return true;
    } catch (error) {
      console.error("Failed to delete sessions:", error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    if (!globalThis.DB) {
      console.error("D1 database not initialized");
      return [];
    }

    try {
      const results = await globalThis.DB.prepare(`
        SELECT * FROM shopify_sessions WHERE shop = ?
      `).bind(shop || null).all();
      
      return results.results.map(result => {
        const session = new Session({
          id: result.id as string,
          shop: result.shop as string,
          state: result.state as string,
          isOnline: Boolean(result.isOnline),
        });

        session.scope = result.scope as string;
        session.accessToken = result.accessToken as string;
        
        if (result.expires) {
          session.expires = new Date(result.expires as number);
        }
        
        if (result.onlineAccessInfo) {
          session.onlineAccessInfo = JSON.parse(result.onlineAccessInfo as string);
        }
        
        return session;
      });
    } catch (error) {
      console.error("Failed to find sessions by shop:", error);
      return [];
    }
  }
}

// Create a single instance of the session storage
const sessionStorage = new D1SessionStorage();

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

export default {
  apiVersion,
  authenticate,
  unauthenticated,
  login,
  registerWebhooks,
  addDocumentResponseHeaders
};

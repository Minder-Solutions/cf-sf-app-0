import { defineConfig, type UserConfig } from "vite";
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev";

import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";

// EXAMPLE from cloudflare: https://github.com/Minder-Solutions/remix-starter-template/blob/main/vite.config.ts
// NOT SURE (for single fetch?)
// import { installGlobals } from "@remix-run/node";
// installGlobals({ nativeFetch: true });

// This is for creating the right type inferences when single-fetch is enabled
// https://v2.remix.run/docs/guides/single-fetch/#enable-single-fetch-types
/** 
declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}
*/

// Handle Shopify environment variables
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    cloudflareDevProxyVitePlugin({
      // environment: "development",
      getLoadContext,
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        // v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  build: {
    minify: true,
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"],
  },
}) satisfies UserConfig;

// https://chatgpt.com/c/68b5e286-1400-8327-8cd0-f222b9ccc534
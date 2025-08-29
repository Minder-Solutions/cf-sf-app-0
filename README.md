# Initial Consideratins

https://developers.cloudflare.com/workers/runtime-apis/bindings/

https://developers.cloudflare.com/kv/api/


Setup two apps one for production, one for development both in the shopify partner UI.
[partnersUI](https://partners.shopify.com/)
# dev instructions
Read package.json -> myBuildNotes
Dev needs its own branch that keeps the wrangler version at 3.
This version never goes into the package.json for main which puts wrangler at 4.

Dev uses  the cf:dev command
This only works after running cf:tunnel to create a local tunnel.

> npm run cf:tunnel
> shopify app config use shopify.app.cftunnel.toml
> npm run cf:dev

The dev app has its own app in Shopify. Create it in the Shopify Partners UI.

## shopify.app.cftunnel.toml (env)

This file will have all the settings for running the app for a dev server
shopify.app.xxx.toml files are like a mix between an .env file and a set of instructions for configuring the Shopify app which is nothing more than a group of settings including urls, client id, client secret, access scopes, and extesions. The access scopes is one thing that must be set in at three places. 
- shopify.app.cftunnel.toml
- shopify.app.production.toml
- and wrangler.jsonc

This toml file describes all the app configurations and can be used to:

1) control what is being served locally at the env level (shop, app)
  > shopify app config use shopify.app.cftunnel.toml
2) put those changes into the app settings on Shopify
  > shopify app deploy
  - This creates versions of the shopify app settings and extensions
  - This is seperate from the remix app code versions.
  - In Shopify Partners apps are versioned groups of app settings and extensions. Like an environment that hosts the actual remix app.
3) client secret is injected by the shopify cli and associated by the client id

### Using shopify.app.cftunnel.toml 

the --tunnel-url in cf:dev is the same as the application url.
for example application_url = "https://dev-tunnel.minder.solutions"
This means it is set:
1) in cloudflare zero trust as the tunnel url
2) in the shopify.app.cftunnel.toml
3) in cf:dev --tunnel-url
4) cf:tunnel associates this with the same url using the --token from cf.

### D1 in dev

confirm but I think:
Wrangler spins up a local dev server that simulates a Worker runtime.

For D1 databases, it does not connect to your Cloudflare-hosted D1 instance by default. Instead, Wrangler creates (or reuses) a local SQLite file in your project folder to simulate your D1 database.

# Production instructions
The production app should also be set up in the Shopify Partners UI. It also needs a toml file but the env aspects are less important now.  They will become secrets and variables in the cloudflare worker. There will be a lot overlap between the shopify toml and the wrangler jsonc. To run the app go to the app UI in Shopify Partners and select to test it on a store frome there.

## shopify.app.production.toml (env)
- Is used to associate the app, url, and the extensions. It creates versions of the app settings and extensions in Shopify.
## wrangler.jsonc (env) and or settings in cloudflare
secrets and variables in cloudflare are the same.  The only difference is that secrets are not visible in the clouflare ui. Other than that they are both just .env
```jsonc
"vars": {
    "SHOPIFY_API_KEY": "your_api_key_here", // put in secrets
    "SHOPIFY_API_SECRET": "your_api_secret_here", // put in secrets
    "SHOPIFY_APP_URL": "https://example.workers.dev", // adjust as needed
    "SCOPES": "write_products" // adjust scopes as needed
  }
```


# Shopify App Template - Cloudflare Workers

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Minder-Solutions/minder-cf-app-sf-setup-0)

## What is this?

A Shopify app starter, built on top of Cloudflare Workers. This template provides a foundation for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using the [Remix](https://remix.run) framework, deployed on Cloudflare's global network.

## Why would I use this?

This lets you deploy the entire Shopify Remix starter application to Cloudflare with a single click. It will setup a repo and a Cloudflare worker named after your project, along with a D1 database and binding to store the session data.

Cloudflare Workers is flexible, scalable, and even has a [free tier for those just getting started.](https://developers.cloudflare.com/workers/platform/pricing/)



## Prerequisites

Before you begin, you'll need the following:

1. **Cloudflare Account**: [Sign up](https://dash.cloudflare.com/sign-up) if you don't have one.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Shopify App**: Create an app in the [Shopify partner dashboard](https://partners.shopify.com/organizations).
4. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.

## Quick Start

1. Click the "Deploy to Cloudflare" button at the top of this README.
2. Configure your deployment settings including worker name and repository details.
3. After deployment, update the `wrangler.jsonc` file in your new repository with the credentials from your Shopify app:

```jsonc
"vars": {
 "SHOPIFY_API_KEY": "your_api_key_here", // Don't use this in production, use secrets in the dashboard https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project
 "SHOPIFY_API_SECRET": "your_api_secret_here", // Don't use this in production, use secrets in the dashboard https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project
 "SHOPIFY_APP_URL": "https://your-worker-name.workers.dev",
 "SCOPES": "write_products,read_orders", // adjust scopes as needed
}
```

You should consider storing them [as secrets in a production application.](https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project) 
## Enabling Additional Databases
This template supports multiple D1 databases which can be useful for more complex applications. Two additional databases (DB2 and DB3) are included in the configuration but commented out by default. Here's how to enable them:
1. Create the databases in Cloudflare Dashboard:
- Go to your Cloudflare Dashboard
- Navigate to Storage & Databases > D1 SQL Database
- Click "Create"
- Name your databases shop_auth_exampledb2 and shop_auth_exampledb3 (these names should match the database name in your wrangler.jsonc)
- Note the generated database IDs for each
2. Update your wrangler.jsonc file
```jsonc
{
  // ... other configuration
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "shop_auth",
      "database_id": "151f7d9b-365f-41d7-83ed-0bf4eeef5086"
    },
    {
      "binding": "DB2",
      "database_name": "shop_auth_exampledb2",
      "database_id": "your-actual-db2-id-from-dashboard"
    },
    {
      "binding": "DB3",
      "database_name": "shop_auth_exampledb3",
      "database_id": "your-actual-db3-id-from-dashboard"
    }
  ],
  // ... rest of configuration
  ````

3. Commit and deploy your changes:
  - After deployment, your Worker will have access to all three databases. You can access them in your code using the bindings. 
  - Visit the example page in the app to see how to interact with multiple databases.

## Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.ts`:



This template comes preconfigured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.ts](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/shopify.server.ts)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.tsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/app._index.tsx).
3. Responding to mandatory webhooks in [/app/routes/webhooks.tsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/webhooks.tsx)

Please read the [documentation for @shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix#authenticating-admin-requests) to understand what other API's are available.

## Troubleshooting

### Updating the URL for your App

You may get an error similar to this "Error: Invalid appUrl configuration 'example.workers.dev', please provide a valid URL." When trying to update the domain in wrangler.jsonc

Make sure you have the url formatted properly, in this example it would be "https://example.workers.dev/"

### Navigating/redirecting breaks an embedded app

Embedded Shopify apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `@remix-run/react` or `@shopify/polaris`. Do not use `<a>`.
2. Use the `redirect` helper returned from `authenticate.admin`. Do not use `redirect` from `@remix-run/node`
3. Use `useSubmit` or `<Form/>` from `@remix-run/react`. Do not use a lowercase `<form/>`.

This only applies if your app is embedded, which it will be by default.

### Non Embedded

Shopify apps are best when they are embedded in the Shopify Admin, which is how this template is configured. If you have a reason to not embed your app please make the following changes:

1. Ensure `embedded = false` is set in [shopify.app.toml`](./shopify.app.toml). [Docs here](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration#global).
2. Pass `isEmbeddedApp: false` to `shopifyApp()` in `./app/shopify.server.js|ts`.
3. Change the `isEmbeddedApp` prop to `isEmbeddedApp={false}` for the `AppProvider` in `/app/routes/app.jsx|tsx`.
4. Remove the `@shopify/app-bridge-react` dependency from [package.json](./package.json) and `vite.config.ts|js`.
5. Remove anything imported from `@shopify/app-bridge-react`.  For example: `NavMenu`, `TitleBar` and `useAppBridge`.

### OAuth goes into a loop when I change my app's scopes

If you change your app's scopes and authentication goes into a loop and fails with a message from Shopify that it tried too many times, you might have forgotten to update your scopes with Shopify.
To do that, you can run the `deploy` CLI command.

### My shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.  

Instead of using the `afterAuth` hook, the recommended approach is to declare app-specific webhooks in the `shopify.app.toml` file.  This approach is easier since Shopify will automatically update changes to webhook subscriptions every time you run `deploy`.  Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?framework=remix&deliveryMethod=https)

## Tech Stack

This template uses [Remix](https://remix.run) with Cloudflare Workers. The following Shopify tools are also included to ease app development:

- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix) provides authentication and methods for interacting with Shopify APIs.
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) allows your app to seamlessly integrate your app within Shopify's Admin.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)




"wrangler": "^4.13.2"

 "wrangler": "3.28.2"



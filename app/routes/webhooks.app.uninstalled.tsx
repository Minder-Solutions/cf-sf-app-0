import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    // Example of how to delete shop sessions directly using DB
    if (globalThis.DB) {
      console.log("Deleting sessions for shop:", shop);
      await globalThis.DB.prepare(`DELETE FROM shopify_sessions WHERE shop = ?`).bind(shop).run();
    } else {
      console.log("Database not initialized, cannot delete sessions");
    }
  }

  return new Response();
};
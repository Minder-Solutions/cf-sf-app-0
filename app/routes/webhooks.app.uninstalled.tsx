import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, getSessionStorage } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    // Use the session storage abstraction to delete the session
    const sessionStorage = getSessionStorage();
    try {
      await sessionStorage.deleteSession(session.id);
      console.log(`Deleted session for shop: ${shop}`);
    } catch (err) {
      console.error(`Failed to delete session for shop: ${shop}`, err);
      return new Response("Failed to delete session", { status: 500 });
    }
  }

  return new Response();
};
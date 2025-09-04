
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
 Page,
} from "@shopify/polaris";

import { authenticate } from "app/shopify.server";
import { drizzle } from 'drizzle-orm/d1';


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const db = drizzle(context.cloudflare.env.DB);
  // 
  // const result = await db.select().from(users).all()

 return {}
 };


export const action = async ({ request }: ActionFunctionArgs) => {
 const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const L = useLoaderData<typeof loader>();
  const A = useActionData<typeof action>();
  return (
<Page>
  <h1>11</h1>
</Page>
  );
}

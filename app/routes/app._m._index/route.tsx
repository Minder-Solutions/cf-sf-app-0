
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
 Page,
} from "@shopify/polaris";

import { authenticate } from "app/shopify.server";
import { drizzle } from 'drizzle-orm/d1';
import { exampleTable, subscriptionTracking } from '../../../drizzle-db/schema'


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const db = drizzle(context.cloudflare.env.DB);
  // 
  const examples = await db.select().from(exampleTable).all()
  const subsderibers = await db.select().from(subscriptionTracking).all()

 return {examples,  subsderibers}
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

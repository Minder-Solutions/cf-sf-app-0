
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
 Page,
} from "@shopify/polaris";

import { authenticate } from "app/shopify.server";
import { drizzle } from 'drizzle-orm/d1';
import { exampleTable, subscriptionTracking } from 'drizzle-db/schema'


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const db = drizzle(context.cloudflare.env.DB);
  // 
  const examples = await db.select().from(exampleTable).all()
  const _subscribers = await db.select().from(subscriptionTracking).all()
  if(_subscribers.length === 0) {
    // https://orm.drizzle.team/docs/insert
  type Subscriber = typeof subscriptionTracking.$inferInsert;
  const seedSubcriber : Subscriber = {
    id: 'string_id',
    shopifySubscriptionId: 'string_a',
    chargeId: 'string_b',
    shopDomain: 'string_c',
    name: 'Monthly',
    status: 'string',
    trialDays: 22,
    createdAt: 'string',
    }
    await db.insert(subscriptionTracking).values(seedSubcriber);
  }
  

  
  const subscribers = await db.select().from(subscriptionTracking).all()

  return {examples,  _subscribers, subscribers}
};


export const action = async ({ request }: ActionFunctionArgs) => {
 const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const lData = useLoaderData<typeof loader>();
  const aData = useActionData<typeof action>();
  return (
<Page>
  <h1>11</h1>
</Page>
  );
}


import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
 Page,

} from "@shopify/polaris";

import { authenticate } from "app/shopify.server";

const MESSAGE = 'This is a basic template for cloudflare with a dep issue on wrangler';

import {getAppUrl} from 'app/features/resource-locations/appUrl';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
 await authenticate.admin(request);

 return {
  _globalThis: globalThis,
  env: {
     SHOPIFY_APP_ID: context.cloudflare.env?.SHOPIFY_APP_ID,
     SHOPIFY_APP_HANDLE: context.cloudflare.env?.SHOPIFY_APP_HANDLE,
     env: context.cloudflare.env
   }
  }
 };


export const action = async ({ request }: ActionFunctionArgs) => {
 const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const lD = useLoaderData<typeof loader>();
  const aD = useActionData<typeof action>();
  const appUrl = getAppUrl(lD.env);
  return (
<Page>
  <h1>11</h1>
  <p>pricing plans: {appUrl.pricingPlans} </p> 
  <p>nutriscore index: {appUrl.adminProductIndexNutriscore}</p>
  <p>Hello !</p>
  <h1>Oh no ::::) figure this ou beans carrots butter</h1>
</Page>
  );
}

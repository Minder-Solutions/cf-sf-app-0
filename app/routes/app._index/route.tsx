import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
 Page,
 Layout,
 Text,
 Card,
 Button,
 BlockStack,
 Box,
 List,
 Link,
 InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";

const MESSAGE = 'This is a basic template for cloudflare with a dep issue on wrangler';

export const loader = async ({ request }: LoaderFunctionArgs) => {
 await authenticate.admin(request);

 return {
  _globalThis: globalThis,
 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
 const { admin } = await authenticate.admin(request);
  return null;
};

export default function Index() {
  const lD = useLoaderData<typeof loader>();
  console.log({lD, globalThis});
  console.log(`_globalThis ${'shopifySessionStorage' in lD._globalThis}`);
  console.log(`GlobalThis ${'shopifySessionStorage' in globalThis}`)
  
  return (
<Page>
  hello
</Page>
  );
}

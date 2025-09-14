
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
 Page,
} from "@shopify/polaris";

import { authenticate } from "app/shopify.server";


export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
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
  <h1>Homepage</h1>
</Page>
  );
}

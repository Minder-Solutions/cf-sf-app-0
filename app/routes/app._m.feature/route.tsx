import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useActionData,} from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { Page,} from "@shopify/polaris";


export async function action({request, params}: ActionFunctionArgs) {
  const { admin, redirect } = await authenticate.admin(request);
  return {a:1};
}

export async function loader ({ request, params }: LoaderFunctionArgs) {
  const {admin, redirect } = await authenticate.admin(request);
  return {l:1};
  
};

export default function Feature() {

  const lData = useLoaderData<typeof loader>();
  const aData = useActionData<typeof action>();

  return (
<Page>
    <h1>Feature</h1>
    <p>
      lData: {lData.l}
    </p>
</Page>
  );
}

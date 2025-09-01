import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData,} from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { Page,} from "@shopify/polaris";

// import { json } from "@remix-run/node";
// https://remix.run/docs/en/main/utils/data

type UserInput = { 
  title: string;
}

export async function action({request, params}: ActionFunctionArgs) {
  const { admin, redirect } = await authenticate.admin(request);
  
  return {a:1};


}

export async function loader ({ request, params }: LoaderFunctionArgs) {
  const {admin, redirect } = await authenticate.admin(request);
  return {l:1};
};

export default function MyPage() {

  const l = useLoaderData<typeof loader>();
  const a = useActionData<typeof action>();

  return (
<Page>
    My Page
</Page>
  );
}

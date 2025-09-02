import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticate } from "app/shopify.server";
import { ShouldRevalidateFunction } from "@remix-run/react";
import billingRedirect from "./billingRedirect";


/**
 * @description always rerun this loader
 */
export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return true;
};

export async function loader ({ request, params, context }: LoaderFunctionArgs) {
  const {admin, redirect, billing } = await authenticate.admin(request);
  const billingInformation =  await billingRedirect(billing, redirect, admin.graphql, context.cloudflare.env);
  return {billingInformation,}
};

/**
 * This is a 'middleware' route across its <Outlet/>
 * Since single fetch is not enabled this route's loader is not guaranteed to finish first
 * However it will still return before the templates are rendered
 * @see https://remix.run/docs/en/main/file-conventions/routes#nested-layouts-without-nested-urls
 */
export default function M() {
  return <div>hello<Outlet/></div>
}

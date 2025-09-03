import {getAppUrl} from 'app/features/resource-locations/appUrl';
import { appMetafieldRead, shouldUpdate } from 'app/features/subscriptions/appInstallationBilling';
import type { BillingType, RedirectType, GraphqlType } from 'app/resources/shared-types';

/**
 *  
 * @param billing 
 * @param redirect 
 * @param graphql 
 * @returns 
 */
export default async function billingRedirect(

  billing: BillingType, 
  redirect: RedirectType, 
  graphql: GraphqlType,
  env: any,
) {
  const appUrl = getAppUrl({appId: env.SHOPIFY_APP_ID, appHandle: env.SHOPIFY_APP_HANDLE});
  /* Subscription state on Shopify */
  //@ts-ignore
  const billingCheck = await billing.check();
  /* Is there any active subscription? -> check for a name */
  const subscription = billingCheck.appSubscriptions?.[0];
  const subscriptionName = subscription?.name;
  /* A. Redirect */
  // straight to shopify hosted billing. This could also go to a page in the hosted app
  if(!subscription) throw redirect(appUrl.pricingPlans, {
    target:'_top'
  });

  /* AppInstallation metafields for billing state on Shopify */
  const appInstallation = await appMetafieldRead({
    graphql,
  });

  if(!appInstallation?.resource) {
    throw new Response("App installation not available", {
      status: 500,
    });
  }

  /* B. Redirect to the subscriptions page hosetd by shopify for the app when there is no subsciption name in the list of known subscriptions*/
  if(shouldUpdate(subscriptionName, appInstallation.resource)) throw redirect(appUrl.subscriptions);

  return {
    name: subscriptionName,
    status: subscription?.status,
    timestamp: Date.now(),
    appInstallation,
    shouldUpdate: shouldUpdate(subscriptionName, appInstallation.resource),
  };
}
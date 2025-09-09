import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, useSubmit,} from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import { Page, Layout, Banner } from "@shopify/polaris";
import {getAppUrl} from "app/features/resource-locations/appUrl";
import { availableIfMetafields } from "./appData";
import { allAccessName, starterName } from "app/features/subscriptions/constants";
import { getCurrentTrialDays } from "app/features/subscriptions/appInstallationBilling";
import { subscriptionTracking } from 'drizzle-db/schema'
import { drizzle } from 'drizzle-orm/d1';


export async function action({request, params, context}: ActionFunctionArgs) {
  const { billing } = await authenticate.admin(request);
  const db = drizzle(context.cloudflare.env.DB);

  //@ts-ignore
  const billingCheck = await billing.check();
  const subscription = billingCheck.appSubscriptions?.[0];

  // const cancelledSubscription
  return await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true,
    prorate: true,
   });
}

export async function loader ({ request, context, params }: LoaderFunctionArgs) {
  // Get charge_id from query parameters
  const url = new URL(request.url);
  const chargeId = url.searchParams.get('charge_id');

  const {admin, redirect, billing, session} = await authenticate.admin(request);

  //@ts-ignore
  const billingCheck =  await billing.check();
  const subscription = billingCheck?.appSubscriptions?.[0];
  const appInstallation  = await availableIfMetafields(admin.graphql, subscription?.name);

  if(appInstallation.appInstallation.hasErrors.signal) {
    throw new Response('Cannot read from the app installation. Please check network connections and try refreshing your browser.')
  }

  /* Keep track of when people subsribe using D1 in order to send a reminder email */
  const db = drizzle(context.cloudflare.env.DB);
  type Subscriber = typeof subscriptionTracking.$inferInsert;
  if(chargeId) {
    const entry: Subscriber = {
        shopifySubscriptionId: subscription.id,
        shopDomain: session.shop,
        name: subscription.name,
        status: subscription.status,
        trialDays: subscription.trialDays,
        createdAt: subscription.createdAt, // ISO-8601
        chargeId,
      }
    await db
      .insert(subscriptionTracking)
      .values(entry)
      .onConflictDoUpdate({
        target: subscriptionTracking.shopDomain,
        set: entry
      });
  }

  const appUrl = getAppUrl({appId: context.cloudflare.env?.SHOPIFY_APP_ID, appHandle: context.cloudflare.env?.SHOPIFY_APP_HANDLE });
  return { billingCheck, subscription, chargeId, appInstallation, appUrl }
};

export default function Subscription() {

  const L = useLoaderData<typeof loader>();

  const submit = useSubmit();

  const subscription = L.subscription;
  let name, status, titleText, trialDays;


  if(subscription) {
    // TODO
    status = subscription?.status;
    name = subscription?.name;
    // trialDays = lData.subscription?.trialDays;
    trialDays = getCurrentTrialDays(subscription);
  
  }
  if(!L.billingCheck?.hasActivePayment) {
    titleText = "Please select a subscription plan to continue."
  } else if(subscription) {
    if(name) {
      titleText = `You are on the ${name} plan. ${L.chargeId ? '🎉' : ''}`

    }
  }
  // THIS MAY NEED ATTENTION ie. bad payment or something research 'status'
  

  return (
<Page>
  <Layout>
     <Layout.Section>
        <Banner
          tone="info"
          title={titleText}
          action={{
            content: 'Manage plans', 
            url: L.appUrl?.pricingPlans,
            target: '_top',
            
          }}
          secondaryAction={
            L.billingCheck?.hasActivePayment ?
            {content: 'Cancel', onAction:()=>{ submit(true, {method:"POST"})}} :
            undefined
          }
        >
        {
          !L.billingCheck?.hasActivePayment && 
          <p>We've got you covered with a free plan. The All Access plan has unlimited use for all features. </p>
        }
        {
          name === starterName && !!!L.chargeId &&
          <p> Your plan is currently limited to Nutriscores. Upgrade to All Access for unlimited use.</p>
        }
        {
          L.chargeId && 
          <p>Thank you for subscribing to Tidy Product Blocks! Your plan is now active. If you have any questions or need help, we're here for you. Enjoy!</p>
        }
        {
          name === allAccessName && trialDays &&
          <p> There are { trialDays } {trialDays === 1 ? 'day' : 'days' }  left in the free trial</p>
        }
    
      </Banner>
     </Layout.Section>
    </Layout>
</Page>
  );
}


// https://admin.shopify.com/store/tidy-product-blocks-test-store/charges/tidy-product-blocks/pricing_plans"
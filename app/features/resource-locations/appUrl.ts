export function getAppUrl (env : any) {
  const appId = env?.SHOPIFY_APP_ID;
  const appHandle = env?.SHOPIFY_APP_HANDLE;
  const appNamespace = `app--${appId}`;

  if(!appId || !appHandle) {
    throw new Error('Missing required environment variables: SHOPIFY_APP_ID and SHOPIFY_APP_HANDLE');
  }

  return {
    home: '/app',
    tables: '/app/tables',
    metafieldTable: id => `/app/tables/${id}`,
    subscriptions: '/app/subscriptions',
    pricingPlans: `https://admin.shopify.com/charges/${appHandle}/pricing_plans`,
    m: 'routes/app._m',
    adminProductIndexNutriscore: `shopify:admin/products?metafields.${appNamespace}.nutriscore=A%2CB%2CC%2CD%2CE`
  };
};


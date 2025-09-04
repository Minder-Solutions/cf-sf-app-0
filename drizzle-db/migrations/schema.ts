import { sqliteTable, AnySQLiteColumn, uniqueIndex, text, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const subscriptionTracking = sqliteTable("subscription_tracking", {
	id: text().primaryKey().notNull(),
	shopifySubscriptionId: text("shopify_subscription_id").notNull(),
	chargeId: text("charge_id").notNull(),
	shopDomain: text("shop_domain").notNull(),
	name: text().notNull(),
	status: text().notNull(),
	trialDays: integer("trial_days").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("subscription_tracking_shop_domain_unique").on(table.shopDomain),
	uniqueIndex("subscription_tracking_shopify_subscription_id_unique").on(table.shopifySubscriptionId),
]);

export const exampleTable = sqliteTable("example_table", {
	key: text().primaryKey().notNull(),
	value: text(),
	updatedAt: integer("updated_at"),
});


PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscription_tracking` (
	`id` integer PRIMARY KEY NOT NULL,
	`shopify_subscription_id` text NOT NULL,
	`charge_id` text NOT NULL,
	`shop_domain` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`trial_days` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_subscription_tracking`("id", "shopify_subscription_id", "charge_id", "shop_domain", "name", "status", "trial_days", "created_at") SELECT "id", "shopify_subscription_id", "charge_id", "shop_domain", "name", "status", "trial_days", "created_at" FROM `subscription_tracking`;--> statement-breakpoint
DROP TABLE `subscription_tracking`;--> statement-breakpoint
ALTER TABLE `__new_subscription_tracking` RENAME TO `subscription_tracking`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_tracking_shopify_subscription_id_unique` ON `subscription_tracking` (`shopify_subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_tracking_shop_domain_unique` ON `subscription_tracking` (`shop_domain`);
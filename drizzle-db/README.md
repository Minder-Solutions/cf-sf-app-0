# Drizzle Database Management

This document provides guidance on safely managing your database schema with Drizzle ORM.

## Available Tables

- `example_table`: Settings table used in the D1 example route
- `subscription_tracking`: Table for tracking Shopify subscriptions
- (Other tables may exist in the database but are not managed by Drizzle)

## Database Commands

### Pulling Schema Changes

To pull the schema from your database (will only pull `example_table`):

```bash
npm run drizzle:pull
```

This command uses the configuration in `drizzle.config.ts` which includes a filter to only introspect the `example_table`.

### Pushing Schema Changes Safely

To push schema changes without risking deletion of tables:

```bash
npm run drizzle:push:safe
```

This command uses a special configuration in `drizzle.push.config.ts` with:
- Strict mode enabled to prevent unexpected schema changes
- A filter to only affect specific tables
- Safety mechanisms to prevent accidental table deletions

## Important Notes

1. **NEVER** run `drizzle-kit push` directly without using the safe script, as it might drop tables that are not defined in your schema

2. The Shopify sessions table is intentionally excluded from Drizzle management to prevent accidental data loss

3. If you need to manage additional tables with Drizzle:
   - Create a new schema file in `drizzle-db/schema/`
   - Update the `index.ts` file to export your new table
   - Add the table name to the `tablesFilter` in both config files

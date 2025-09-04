import { sqliteTable, AnySQLiteColumn, text, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const exampleTable = sqliteTable("example_table", {
	key: text().primaryKey(),
	value: text(),
	updatedAt: integer("updated_at"),
});


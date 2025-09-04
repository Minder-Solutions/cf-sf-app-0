import * as t from "drizzle-orm/sqlite-core";

export const exampleTable = t.sqliteTable("example_table", {
  key: t.text().primaryKey(),
  value: t.text(),
  updatedAt: t.integer("updated_at"),
});

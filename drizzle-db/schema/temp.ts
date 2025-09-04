import * as t from "drizzle-orm/sqlite-core";

export const TemporaryTable = t.sqliteTable("temporary_table", {
  key: t.text().primaryKey(),
  value: t.text(),
  updatedAt: t.integer("updated_at"),
});
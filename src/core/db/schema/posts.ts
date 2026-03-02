import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampsWithSoftDelete } from "./columns.helpers";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  ...timestampsWithSoftDelete,
});

// Type inference
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

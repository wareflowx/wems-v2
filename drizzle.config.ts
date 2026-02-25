import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/core/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data/database.db",
  },
});

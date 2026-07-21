import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Force Prisma CLI to use direct port 5432 for migrations/pushes
    url: env("DIRECT_URL") || env("DATABASE_URL")?.replace(":6543", ":5432"),
  },
});
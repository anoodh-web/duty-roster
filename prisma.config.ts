import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Uses process.env directly so `npx prisma generate` never crashes
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
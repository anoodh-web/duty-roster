import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Safely falls back to DATABASE_URL if DIRECT_URL is missing
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
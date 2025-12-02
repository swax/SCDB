import dotenv from "dotenv";
import { defineConfig } from "prisma/config";
import { existsSync } from "fs";
import { resolve } from "path";

// Load .env.local first (if it exists), then .env
const envLocalPath = resolve(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

export default defineConfig({
  schema: "database/schema.prisma",
  datasource: {
    url: process.env.DATABASE_POOLED_URL || process.env.DATABASE_URL || "",
  },
});

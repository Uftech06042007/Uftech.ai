import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI doesn't load Next.js's env files on its own, so pull in
// .env.local (where DATABASE_URL lives) explicitly. Also loads .env for
// parity with Next.js's own precedence, in case one is ever added back.
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

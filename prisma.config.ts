import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Run after `prisma migrate dev` / `prisma migrate reset`, and on demand
    // via `npm run db:seed`. The script is idempotent.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Read straight from process.env rather than Prisma's `env()` helper: that
    // helper resolves eagerly while the config file loads, so an unset var
    // breaks every prisma command — including `prisma generate`, which needs no
    // database at all and runs from postinstall on every `npm ci`. Migrate and
    // introspect still fail loudly when the URL is genuinely missing.
    url: process.env.DATABASE_URL,
  },
});

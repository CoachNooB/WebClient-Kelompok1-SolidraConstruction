import { Redis } from "@upstash/redis";
import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { cacheKey } from "@/lib/cache/keys";
import { parseEnvironment } from "@/lib/env";

const expectedTables = [
  "users",
  "sessions",
  "pages",
  "page_revisions",
  "page_revision_translations",
  "page_sections",
  "section_cards",
  "section_card_translations",
  "investor_documents",
  "career_applications",
  "audit_logs",
];

async function main() {
  const env = parseEnvironment(process.env);
  if (!env.integrationsEnabled) throw new Error("NODE_ENV=production is required");
  if (!process.env.SUPABASE_CV_BUCKET) throw new Error("SUPABASE_CV_BUCKET is required");

  const pg = new Client({ connectionString: env.DATABASE_URL });
  await pg.connect();
  try {
    const schema = await pg.query("select schema_name from information_schema.schemata where schema_name = 'solidra'");
    if (schema.rowCount !== 1) throw new Error("solidra schema is missing");

    const publicTables = await pg.query("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'");
    if ((publicTables.rowCount ?? 0) > 0) throw new Error(`public schema contains application tables: ${publicTables.rows.map((row) => row.table_name).join(", ")}`);

    const tables = await pg.query("select table_name from information_schema.tables where table_schema = 'solidra' and table_type = 'BASE TABLE'");
    const tableNames = new Set(tables.rows.map((row) => row.table_name));
    const missing = expectedTables.filter((table) => !tableNames.has(table));
    if (missing.length) throw new Error(`solidra schema missing tables: ${missing.join(", ")}`);
  } finally {
    await pg.end();
  }

  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  const key = cacheKey("verify", Date.now());
  await redis.set(key, "ok", { ex: 60 });
  const value = await redis.get(key);
  await redis.del(key);
  if (value !== "ok") throw new Error("Redis verification failed");

  const robots = await readFile("app/robots.ts", "utf8");
  if (!robots.includes("/back-office")) throw new Error("robots.ts does not disallow /back-office");
}

main().then(() => {
  console.log("Production verification passed");
}).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

/**
 * `npm run db:init` — explicitly creates data/app.db and its tables.
 * The app also runs this migration automatically on first DB access, so
 * this script is mostly for CI/setup clarity and for confirming the
 * catalog DB path resolves correctly before you start the dev server.
 */
import { getAppDb } from "../src/lib/db/app";
import { getCatalogDb } from "../src/lib/db/catalog";

function main() {
  console.log("Checking catalog DB (read-only)...");
  const catalog = getCatalogDb();
  const pkgCount = catalog.prepare(`SELECT COUNT(*) as n FROM tour_packages`).get() as { n: number };
  console.log(`  OK — ${pkgCount.n} tour_packages found.`);

  console.log("Initializing app DB (additive)...");
  const app = getAppDb();
  const tables = app
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'app_%'`)
    .all() as { name: string }[];
  console.log(`  OK — ${tables.length} app_* tables ready: ${tables.map((t) => t.name).join(", ")}`);

  console.log("\nDone. Run `npm run dev` to start the app.");
}

main();

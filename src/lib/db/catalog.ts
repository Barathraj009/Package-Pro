/**
 * Read-only connection to the Kognivera-provided catalog database
 * (data/PS-04.db). We NEVER write to this file, and we never modify or
 * rename its schema (rule R1) — everything app-specific lives in app.db
 * instead (see ./app.ts).
 */
import Database from "better-sqlite3";
import path from "node:path";

let db: Database.Database | null = null;

export function getCatalogDb(): Database.Database {
  if (db) return db;
  const dbPath = process.env.CATALOG_DB_PATH
    ? path.resolve(process.cwd(), process.env.CATALOG_DB_PATH)
    : path.resolve(process.cwd(), "data", "PS-04.db");

  db = new Database(dbPath, { readonly: true, fileMustExist: true });
  db.pragma("foreign_keys = ON");
  return db;
}

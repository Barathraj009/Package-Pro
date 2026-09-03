/**
 * Read-write connection to PackagePro's own additive database (app.db).
 * Everything the hackathon spec needs beyond the given PS-04 schema lives
 * here: sessions, preference overrides, saved customizations, share links,
 * bookings. We never touch PS-04.db's tables (rule R1) — this is purely
 * additive, sitting alongside the read-only catalog.
 *
 * IDs follow R2 (opaque prefixed strings) and money columns follow R3
 * (TEXT, 2dp decimal + currency, never REAL/float) to stay consistent with
 * the rest of the data, even though R1–R8 technically only bind the fields
 * that came with the dataset.
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

let db: Database.Database | null = null;

const MIGRATIONS = `
CREATE TABLE IF NOT EXISTS app_sessions (
  session_id            TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

-- Overlays the catalog's read-only user_preferences row for a user once
-- they change their language settings in the app. Falls back to the
-- seeded catalog row when no override exists yet.
CREATE TABLE IF NOT EXISTS app_user_preference_overrides (
  user_id               TEXT PRIMARY KEY,
  preferred_languages   TEXT NOT NULL,
  guide_language        TEXT,
  updated_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_package_customizations (
  customization_id      TEXT PRIMARY KEY,
  package_id            TEXT NOT NULL,
  user_id               TEXT,
  trip_start_date       TEXT,
  selections_json       TEXT NOT NULL,
  computed_total_amount TEXT NOT NULL,
  computed_total_currency TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'draft',
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_share_links (
  share_token           TEXT PRIMARY KEY,
  customization_id      TEXT NOT NULL,
  created_at            TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS app_bookings (
  booking_id            TEXT PRIMARY KEY,
  customization_id      TEXT NOT NULL,
  user_id               TEXT NOT NULL,
  booking_reference     TEXT NOT NULL UNIQUE,
  total_amount          TEXT NOT NULL,
  currency              TEXT NOT NULL,
  idempotency_key       TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'confirmed',
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customizations_user ON app_package_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_customizations_package ON app_package_customizations(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON app_bookings(user_id);
`;

export function getAppDb(): Database.Database {
  if (db) return db;
  const dbPath = process.env.APP_DB_PATH
    ? path.resolve(process.cwd(), process.env.APP_DB_PATH)
    : path.resolve(process.cwd(), "data", "app.db");

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(MIGRATIONS);
  return db;
}

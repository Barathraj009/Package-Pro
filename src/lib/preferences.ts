/**
 * Effective preferences = seeded catalog user_preferences row, overlaid
 * with anything the traveller has changed in the app (stored in app.db,
 * since the catalog DB is read-only — rule R1).
 */
import { getAppDb } from "@/lib/db/app";
import { getUserPreferences } from "@/lib/db/queries";
import { parseLangList } from "@/lib/lang";

export interface EffectivePreferences {
  userId: string;
  preferredLanguages: string[];
  guideLanguage: string | null;
  interests: string[];
  source: "override" | "catalog" | "default";
}

export function getEffectivePreferences(userId: string): EffectivePreferences {
  const db = getAppDb();
  const override = db
    .prepare<[string]>(`SELECT * FROM app_user_preference_overrides WHERE user_id = ?`)
    .get(userId) as { preferred_languages: string; guide_language: string | null } | undefined;

  if (override) {
    return {
      userId,
      preferredLanguages: parseLangList(override.preferred_languages),
      guideLanguage: override.guide_language,
      interests: [],
      source: "override",
    };
  }

  const catalog = getUserPreferences(userId);
  if (catalog) {
    return {
      userId,
      preferredLanguages: parseLangList(catalog.preferred_languages),
      guideLanguage: catalog.guide_language,
      interests: parseLangList(catalog.interests),
      source: "catalog",
    };
  }

  return { userId, preferredLanguages: ["en-IN"], guideLanguage: null, interests: [], source: "default" };
}

export function setPreferenceOverride(userId: string, preferredLanguages: string[], guideLanguage: string | null) {
  const db = getAppDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO app_user_preference_overrides (user_id, preferred_languages, guide_language, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET preferred_languages = excluded.preferred_languages,
       guide_language = excluded.guide_language, updated_at = excluded.updated_at`
  ).run(userId, preferredLanguages.join(","), guideLanguage, now);
}

/**
 * Lightweight demo auth: the traveller picks a seeded `users` row to "log
 * in as" (per the hackathon decisions — no full auth system needed). The
 * session is just a cookie holding the user_id; app_sessions in app.db
 * keeps a record for auditability but nothing depends on it being present.
 */
import { cookies } from "next/headers";
import { getAppDb } from "@/lib/db/app";
import { newId } from "@/lib/ids";

const COOKIE_NAME = "packagepro_session_user";

export function getCurrentUserId(): string | null {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export function startSession(userId: string) {
  const store = cookies();
  store.set(COOKIE_NAME, userId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });

  const db = getAppDb();
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO app_sessions (session_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(
    newId("ses"),
    userId,
    now,
    now
  );
}

export function endSession() {
  const store = cookies();
  store.delete(COOKIE_NAME);
}

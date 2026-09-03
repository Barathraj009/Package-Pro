import { NextRequest, NextResponse } from "next/server";
import { getEffectivePreferences, setPreferenceOverride } from "@/lib/preferences";
import { getCurrentUserId } from "@/lib/session";
import { listLanguages } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "No active session — log in first" }, { status: 401 });

  const preferences = getEffectivePreferences(userId);
  const languages = listLanguages();
  return NextResponse.json({ preferences, languages });
}

export async function PUT(req: NextRequest) {
  const userId = getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "No active session — log in first" }, { status: 401 });

  const body = (await req.json()) as { preferredLanguages: string[]; guideLanguage: string | null };
  if (!Array.isArray(body.preferredLanguages) || body.preferredLanguages.length === 0) {
    return NextResponse.json({ error: "preferredLanguages must be a non-empty array" }, { status: 400 });
  }

  setPreferenceOverride(userId, body.preferredLanguages, body.guideLanguage ?? null);
  const preferences = getEffectivePreferences(userId);
  return NextResponse.json({ preferences });
}

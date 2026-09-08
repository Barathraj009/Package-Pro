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

  const body = (await req.json()) as {
    preferredLanguages: string[];
    guideLanguage: string | null;
    interests?: string;
  };
  if (!Array.isArray(body.preferredLanguages) || body.preferredLanguages.length === 0) {
    return NextResponse.json({ error: "preferredLanguages must be a non-empty array" }, { status: 400 });
  }

  // Free-text interests become a cleaned comma list; a single string or empty is fine.
  const interests = typeof body.interests === "string" ? body.interests : "";
  const interestList = interests
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0 && s.length <= 60)
    .slice(0, 12);

  setPreferenceOverride(userId, body.preferredLanguages, body.guideLanguage ?? null, interestList);
  const preferences = getEffectivePreferences(userId);
  return NextResponse.json({ preferences });
}

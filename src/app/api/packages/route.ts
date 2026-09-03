import { NextRequest, NextResponse } from "next/server";
import { listPackages } from "@/lib/db/queries";
import { getEffectivePreferences } from "@/lib/preferences";
import { packageLanguageScore, parseLangList } from "@/lib/lang";
import { getCurrentUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme") ?? undefined;
  const userIdParam = searchParams.get("userId") ?? undefined;

  const packages = listPackages({ theme });

  const userId = userIdParam ?? getCurrentUserId();
  let preferredLanguages: string[] = [];
  if (userId) {
    preferredLanguages = getEffectivePreferences(userId).preferredLanguages;
  }

  const withScore = packages.map((p) => ({
    ...p,
    languageMatchScore: packageLanguageScore(preferredLanguages, parseLangList(p.languages_offered)),
  }));

  if (preferredLanguages.length > 0) {
    withScore.sort((a, b) => b.languageMatchScore - a.languageMatchScore);
  }

  return NextResponse.json({ packages: withScore, preferredLanguages });
}

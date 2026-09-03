/**
 * Language-preference matching. Everything here works on BCP-47 tags
 * (rule R6) — never full language names.
 */

export function parseLangList(csv: string | null | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Base-tag match: "en-IN" and "en" are treated as a match on "en". */
function baseTag(bcp47: string): string {
  return bcp47.split("-")[0]!.toLowerCase();
}

export function languagesOverlap(a: string[], b: string[]): boolean {
  const bBase = new Set(b.map(baseTag));
  return a.some((tag) => bBase.has(baseTag(tag)));
}

export function overlapCount(a: string[], b: string[]): number {
  const bBase = new Set(b.map(baseTag));
  return a.filter((tag) => bBase.has(baseTag(tag))).length;
}

/**
 * Score a package against the traveller's preferred languages. Higher is
 * better. Exact matches score highest; base-tag matches (en vs en-IN)
 * still count. Zero means no overlap at all.
 */
export function packageLanguageScore(preferred: string[], packageLanguagesOffered: string[]): number {
  if (preferred.length === 0) return 0;
  let score = 0;
  for (const p of preferred) {
    if (packageLanguagesOffered.includes(p)) score += 2;
    else if (packageLanguagesOffered.some((o) => baseTag(o) === baseTag(p))) score += 1;
  }
  return score;
}

export function guideLanguageScore(preferredGuideLanguage: string | null | undefined, guideLanguages: string[]): number {
  if (!preferredGuideLanguage) return 0;
  if (guideLanguages.includes(preferredGuideLanguage)) return 2;
  if (guideLanguages.some((g) => baseTag(g) === baseTag(preferredGuideLanguage))) return 1;
  return 0;
}

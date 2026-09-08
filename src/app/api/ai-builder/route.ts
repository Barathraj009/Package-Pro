import { NextRequest, NextResponse } from "next/server";
import { getCatalogDb } from "@/lib/db/catalog";
import { searchGuides } from "@/lib/db/queries";
import { checkRateLimit } from "@/lib/rateLimit";
import type { TourPackage, TourGuide } from "@/lib/types";

interface BuilderBody {
  interests: string; // free text, e.g. "temples, slow mornings, local food"
  budget?: number;
  currency?: string; // defaults to INR
  preferredLanguages?: string[];
  userId?: string;
}

interface Candidate {
  package: TourPackage;
  keywordHits: number;
}

const STOPWORDS = new Set([
  "the",
  "and",
  "a",
  "an",
  "of",
  "in",
  "to",
  "with",
  "for",
  "i",
  "want",
  "like",
  "some",
  "into",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** RAG step 1: retrieve real candidate rows from the DB — never let the model invent them. */
function retrieveCandidates(interests: string, budget: number | undefined, currency: string): Candidate[] {
  const db = getCatalogDb();
  const clauses = [`status = 'active'`, `currency = ?`];
  const params: (string | number)[] = [currency];
  if (budget) {
    clauses.push(`CAST(base_price AS REAL) <= ?`);
    params.push(budget * 1.15); // small headroom — packages, not exact quotes
  }

  const packages = db
    .prepare(`SELECT * FROM tour_packages WHERE ${clauses.join(" AND ")}`)
    .all(...params) as TourPackage[];

  const tokens = tokenize(interests);
  const scored: Candidate[] = packages.map((p) => {
    const haystack = tokenize(`${p.theme} ${p.name} ${p.description} ${p.inclusions} ${p.difficulty}`);
    const hits = tokens.filter((t) => haystack.includes(t)).length;
    return { package: p, keywordHits: hits };
  });

  return scored.sort((a, b) => b.keywordHits - a.keywordHits).slice(0, 8);
}

function retrieveGuideCandidates(cityIds: string[], preferredLanguages: string[]): TourGuide[] {
  const seen = new Map<string, TourGuide>();
  for (const cityId of cityIds) {
    for (const lang of preferredLanguages.length ? preferredLanguages : [undefined]) {
      for (const g of searchGuides({ cityId, language: lang })) {
        seen.set(g.guide_id, g);
      }
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8);
}

function ruleBasedFallback(candidates: Candidate[], guides: TourGuide[]) {
  const top = candidates[0];
  return {
    recommendedPackageId: top?.package.package_id ?? null,
    reasoning: top
      ? `Rule-based match: "${top.package.name}" scored highest on keyword overlap with your interests among packages in budget.`
      : "No package matched your budget and currency — try widening the budget.",
    suggestedGuideId: guides[0]?.guide_id ?? null,
    alternates: candidates.slice(1, 4).map((c) => c.package.package_id),
    aiPowered: false,
  };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (!checkRateLimit(`ai-builder:${ip}`, 6, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded — try again in a minute." }, { status: 429 });
  }

  const body = (await req.json()) as BuilderBody;
  if (!body.interests || body.interests.trim().length === 0) {
    return NextResponse.json({ error: "interests is required (free text)" }, { status: 400 });
  }

  const interests = body.interests.trim().slice(0, 500);

  const currency = body.currency ?? "INR";
  const candidates = retrieveCandidates(interests, body.budget, currency);
  const cityIds = Array.from(new Set(candidates.map((c) => c.package.city_id)));
  const guides = retrieveGuideCandidates(cityIds, body.preferredLanguages ?? []);

  if (candidates.length === 0) {
    return NextResponse.json({
      recommendedPackageId: null,
      reasoning: `No active ${currency} packages matched your budget. Try a different budget or currency.`,
      suggestedGuideId: null,
      alternates: [],
      aiPowered: false,
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(ruleBasedFallback(candidates, guides));
  }

  try {
    const candidateSummary = candidates
      .map(
        (c) =>
          `- id=${c.package.package_id} | ${c.package.name} | theme=${c.package.theme} | tier=${c.package.tier} | ${c.package.duration_days}d | price=${c.package.base_price} ${c.package.currency} | languages=${c.package.languages_offered}`
      )
      .join("\n");
    const guideSummary = guides
      .map(
        (g) =>
          `- id=${g.guide_id} | ${g.display_name} | ${g.specialisation} | languages=${g.languages} | rating=${g.rating ?? "n/a"}`
      )
      .join("\n");

    const systemPrompt = `You are composing a travel package recommendation for PackagePro, grounded ONLY in the real rows given below. NEVER invent an id, price, or name that is not in these lists. Respond with a single JSON object matching this shape exactly:
{"recommendedPackageId": "<id from the package list>", "reasoning": "<2-3 sentences, plain and specific>", "suggestedGuideId": "<id from the guide list, or an empty string if none fits>", "alternates": ["<id>", "<id>"]}
Output no commentary before or after the JSON object.`;

    const userPrompt = `Traveller interests: ${interests}
Budget: ${body.budget ?? "not specified"} ${currency}
Preferred languages: ${(body.preferredLanguages ?? []).join(", ") || "not specified"}

Candidate packages:
${candidateSummary}

Candidate guides:
${guideSummary}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "package_recommendation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                recommendedPackageId: { type: "string" },
                reasoning: { type: "string" },
                suggestedGuideId: { type: "string" },
                alternates: { type: "array", items: { type: "string" } },
              },
              required: ["recommendedPackageId", "reasoning", "suggestedGuideId", "alternates"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      let detail = `Groq API returned ${response.status}`;
      try {
        const errBody = await response.json();
        detail += `: ${errBody?.error?.message ?? JSON.stringify(errBody)}`;
      } catch {
        // response body not readable — keep the plain status detail
      }
      throw new Error(detail);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);

    // Validate the model didn't invent anything — every id must come from
    // the candidate sets we actually retrieved.
    const validPackageIds = new Set(candidates.map((c) => c.package.package_id));
    const validGuideIds = new Set(guides.map((g) => g.guide_id));

    const recommendedPackageId = validPackageIds.has(parsed.recommendedPackageId)
      ? parsed.recommendedPackageId
      : candidates[0]?.package.package_id ?? null;
    const suggestedGuideId =
      typeof parsed.suggestedGuideId === "string" && validGuideIds.has(parsed.suggestedGuideId)
        ? parsed.suggestedGuideId
        : null;
    const alternates = Array.isArray(parsed.alternates)
      ? parsed.alternates.filter((id: string) => validPackageIds.has(id))
      : [];

    return NextResponse.json({
      recommendedPackageId,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "AI recommendation composed from your interests.",
      suggestedGuideId,
      alternates,
      aiPowered: true,
    });
  } catch (err) {
    // Graceful degrade — never fail the request just because the AI call did.
    return NextResponse.json({
      ...ruleBasedFallback(candidates, guides),
      note: `AI builder unavailable (${err instanceof Error ? err.message : "unknown error"}) — showing rule-based match instead.`,
    });
  }
}

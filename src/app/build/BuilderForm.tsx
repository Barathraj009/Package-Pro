"use client";

import { useState } from "react";
import Link from "next/link";
import type { Language } from "@/lib/types";
import { t, resolveUiLanguage } from "@/lib/i18n";

interface BuilderResponse {
  recommendedPackageId: string | null;
  reasoning: string;
  suggestedGuideId: string | null;
  alternates: string[];
  aiPowered: boolean;
  note?: string;
}

export default function BuilderForm({
  initialUserId,
  initialUserName,
  initialPreferredLanguages,
  initialInterests,
  languages,
}: {
  initialUserId: string | null;
  initialUserName: string | null;
  initialPreferredLanguages: string[];
  initialInterests: string[];
  languages: Language[];
}) {
  const uiLang = resolveUiLanguage(initialPreferredLanguages);
  const [interests, setInterests] = useState(initialInterests.join(", "));
  const [budget, setBudget] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set(initialPreferredLanguages));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuilderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleLang(bcp47: string) {
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      if (next.has(bcp47)) next.delete(bcp47);
      else next.add(bcp47);
      return next;
    });
  }

  async function build() {
    if (!interests.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: interests.trim(),
          budget: budget ? Number(budget) : undefined,
          preferredLanguages: Array.from(selectedLangs),
          userId: initialUserId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong building your trip.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border border-mist rounded-2xl bg-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-2" htmlFor="interests">
            {t("builder.interestsLabel", uiLang)}
          </label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder={t("builder.interestsPlaceholder", uiLang)}
            rows={3}
            className="w-full border border-mist rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-route"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2" htmlFor="budget">
            {t("builder.budgetLabel", uiLang)}
          </label>
          <input
            id="budget"
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={t("builder.budgetHint", uiLang)}
            className="w-full border border-mist rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-route"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink mb-2">{t("builder.langLabel", uiLang)}</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.bcp47}
                type="button"
                onClick={() => toggleLang(l.bcp47)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedLangs.has(l.bcp47)
                    ? "bg-route text-paper border-route"
                    : "border-mist text-ink/70 hover:border-route"
                }`}
              >
                {l.native_name} <span className="text-xs opacity-60">({l.bcp47})</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={build}
          disabled={loading || !interests.trim()}
          className="w-full bg-route text-paper py-2.5 rounded-full font-medium hover:bg-route-dark transition-colors disabled:opacity-50"
        >
          {loading ? t("builder.building", uiLang) : t("builder.build", uiLang)}
        </button>

        {error && <p className="text-xs text-stamp">{error}</p>}
      </div>

      {result && <BuilderResult result={result} uiLang={uiLang} />}
    </div>
  );
}

function BuilderResult({ result, uiLang }: { result: BuilderResponse; uiLang: string }) {
  return (
    <div className="space-y-6">
      <div className="border border-mist rounded-2xl bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-ink">{t("builder.recommended", uiLang)}</span>
          <span
            className={`font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
              result.aiPowered ? "bg-route/10 text-route" : "bg-brass/15 text-brass"
            }`}
          >
            {result.aiPowered ? t("builder.aiPowered", uiLang) : t("builder.ruleMatched", uiLang)}
          </span>
        </div>

        {result.recommendedPackageId ? (
          <Link
            href={`/packages/${result.recommendedPackageId}`}
            className="block border border-mist rounded-xl p-4 hover:border-route transition-colors bg-paper"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-brass mb-1">{result.recommendedPackageId}</p>
            <p className="font-display text-xl text-ink">View this package →</p>
            <p className="text-sm text-ink/60 mt-2">{result.reasoning}</p>
          </Link>
        ) : (
          <p className="text-sm text-ink/60">{t("builder.empty", uiLang)}</p>
        )}

        {result.suggestedGuideId && (
          <div className="mt-4">
            <p className="text-xs font-medium text-ink/70 mb-2">{t("builder.guide", uiLang)}</p>
            <p className="font-mono text-xs text-brass">{result.suggestedGuideId}</p>
          </div>
        )}
      </div>

      {result.alternates.length > 0 && (
        <div className="border border-mist rounded-2xl bg-card p-6">
          <p className="text-sm font-medium text-ink mb-3">{t("builder.alternates", uiLang)}</p>
          <div className="space-y-2">
            {result.alternates.map((id) => (
              <Link
                key={id}
                href={`/packages/${id}`}
                className="block text-sm text-route hover:underline underline-offset-4"
              >
                {id}
              </Link>
            ))}
          </div>
        </div>
      )}

      {result.note && <p className="text-xs text-ink/50 italic">{result.note}</p>}
    </div>
  );
}
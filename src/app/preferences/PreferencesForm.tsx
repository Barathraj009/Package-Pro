"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EffectivePreferences } from "@/lib/preferences";
import type { Language } from "@/lib/types";
import { t, resolveUiLanguage } from "@/lib/i18n";

export default function PreferencesForm({
  initialPreferences,
  languages,
}: {
  initialPreferences: EffectivePreferences;
  languages: Language[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialPreferences.preferredLanguages));
  const [guideLanguage, setGuideLanguage] = useState<string | null>(initialPreferences.guideLanguage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const uiLang = resolveUiLanguage(Array.from(selected));

  function toggle(bcp47: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(bcp47)) next.delete(bcp47);
      else next.add(bcp47);
      return next;
    });
    setSaved(false);
  }

  async function save() {
    if (selected.size === 0) return;
    setSaving(true);
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredLanguages: Array.from(selected), guideLanguage }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-ink mb-3">{t("prefs.preferredLanguages", uiLang)}</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.bcp47}
              onClick={() => toggle(l.bcp47)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selected.has(l.bcp47)
                  ? "bg-route text-paper border-route"
                  : "border-mist text-ink/70 hover:border-route"
              }`}
            >
              {l.native_name} <span className="text-xs opacity-60">({l.bcp47})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-3">{t("prefs.guideLanguage", uiLang)}</p>
        <select
          className="w-full border border-mist rounded-lg px-3 py-2 text-sm bg-paper"
          value={guideLanguage ?? ""}
          onChange={(e) => {
            setGuideLanguage(e.target.value || null);
            setSaved(false);
          }}
        >
          <option value="">{t("prefs.noPref", uiLang)}</option>
          {languages.map((l) => (
            <option key={l.bcp47} value={l.bcp47}>
              {l.native_name} ({l.bcp47})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={save}
        disabled={saving || selected.size === 0}
        className="bg-route text-paper px-6 py-2.5 rounded-full font-medium hover:bg-route-dark transition-colors disabled:opacity-50"
      >
        {t("prefs.save", uiLang)}
      </button>

      {saved && <p className="text-sm text-route">{t("prefs.saved", uiLang)}</p>}
    </div>
  );
}

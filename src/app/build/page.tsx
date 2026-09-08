import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getUser } from "@/lib/db/queries";
import { getEffectivePreferences } from "@/lib/preferences";
import { listLanguages } from "@/lib/db/queries";
import { resolveUiLanguage, t } from "@/lib/i18n";
import BuilderForm from "./BuilderForm";

export default function BuilderPage() {
  const userId = getCurrentUserId();
  const user = userId ? getUser(userId) : undefined;
  const prefs = userId ? getEffectivePreferences(userId) : null;
  const uiLang = prefs ? resolveUiLanguage(prefs.preferredLanguages) : "en";
  const languages = listLanguages();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">{t("builder.title", uiLang)}</h1>
      <p className="text-ink/60 mb-8">{t("builder.subtitle", uiLang)}</p>
      <BuilderForm
        initialUserId={userId}
        initialUserName={user?.display_name ?? null}
        initialPreferredLanguages={prefs?.preferredLanguages ?? []}
        initialInterests={prefs?.interests ?? []}
        languages={languages}
      />
    </div>
  );
}
import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getEffectivePreferences } from "@/lib/preferences";
import { listLanguages } from "@/lib/db/queries";
import { resolveUiLanguage, t } from "@/lib/i18n";
import PreferencesForm from "./PreferencesForm";

export default function PreferencesPage() {
  const userId = getCurrentUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60 mb-4">{t("prefs.loginFirst", "en")}</p>
        <Link href="/login" className="text-route underline underline-offset-4">
          {t("login.pick", "en")}
        </Link>
      </div>
    );
  }

  const prefs = getEffectivePreferences(userId);
  const languages = listLanguages();
  const uiLang = resolveUiLanguage(prefs.preferredLanguages);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">{t("prefs.title", uiLang)}</h1>
      <p className="text-ink/60 mb-8">{t("prefs.note", uiLang)}</p>
      <PreferencesForm initialPreferences={prefs} languages={languages} />
    </div>
  );
}

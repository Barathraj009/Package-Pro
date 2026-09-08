import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getEffectivePreferences } from "@/lib/preferences";
import { resolveUiLanguage, t } from "@/lib/i18n";

export default function HomePage() {
  const userId = getCurrentUserId();
  const uiLang = userId ? resolveUiLanguage(getEffectivePreferences(userId).preferredLanguages) : "en";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="grid md:grid-cols-[1.3fr,1fr] gap-12 items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass mb-4">
            {t("home.badge", uiLang)}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-ink">
            {t("home.tagline1", uiLang)}
            <br />
            <span className="italic text-route">{t("home.tagline2", uiLang)}</span>
            <br />
            {t("home.tagline3", uiLang)}
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-md">{t("home.lead", uiLang)}</p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-route text-paper px-6 py-3 rounded-full font-medium hover:bg-route-dark transition-colors"
            >
              {t("home.browse", uiLang)}
            </Link>
            <Link
              href="/build"
              className="inline-flex items-center gap-2 border border-route text-route px-6 py-3 rounded-full font-medium hover:bg-route/5 transition-colors"
            >
              {t("home.buildCta", uiLang)}
            </Link>
            <Link href="/preferences" className="text-sm text-ink/60 hover:text-route underline underline-offset-4">
              {t("home.setLang", uiLang)}
            </Link>
          </div>
        </div>

        <div className="border border-mist rounded-2xl bg-card p-6">
          <div className="route-divider mb-6" />
          <ol className="space-y-5">
            {[
              [t("home.step1Title", uiLang), t("home.step1Body", uiLang)],
              [t("home.step2Title", uiLang), t("home.step2Body", uiLang)],
              [t("home.step3Title", uiLang), t("home.step3Body", uiLang)],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-sm text-brass mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-medium text-ink">{title}</p>
                  <p className="text-sm text-ink/60 mt-1">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

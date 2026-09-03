import { listPackages, getCity } from "@/lib/db/queries";
import { getCurrentUserId } from "@/lib/session";
import { getEffectivePreferences } from "@/lib/preferences";
import { packageLanguageScore, parseLangList } from "@/lib/lang";
import { t, resolveUiLanguage } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-i18n";
import ThemeTabs from "@/components/ThemeTabs";
import PackageCard from "@/components/PackageCard";

export default function PackagesPage({ searchParams }: { searchParams: { theme?: string } }) {
  const theme = searchParams.theme;
  const packages = listPackages({ theme });

  const userId = getCurrentUserId();
  const prefs = userId ? getEffectivePreferences(userId) : null;
  const uiLang = prefs ? resolveUiLanguage(prefs.preferredLanguages) : "en";
  const preferredLanguages = prefs?.preferredLanguages ?? [];

  const cityNames = new Map<string, string>();
  const ranked = packages
    .map((p) => {
      if (!cityNames.has(p.city_id)) {
        const city = getCity(p.city_id);
        cityNames.set(p.city_id, city ? localizeContent(uiLang, `cty:${city.city_id}`, city.name) : "");
      }
      return {
        pkg: p,
        pkgName: localizeContent(uiLang, `pkg:${p.package_id}:name`, p.name),
        score: packageLanguageScore(preferredLanguages, parseLangList(p.languages_offered)),
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">{t("packages.title", uiLang)}</h1>
        <p className="text-ink/60 mt-1">{t("packages.subtitle", uiLang)}</p>
      </div>

      <ThemeTabs activeTheme={theme} uiLang={uiLang} />

      {preferredLanguages.length > 0 && (
        <p className="text-xs text-route mt-4 mb-2 font-mono uppercase tracking-wide">
          {t("packages.recommendedForYou", uiLang)}: {preferredLanguages.join(", ")}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {ranked.map(({ pkg, pkgName, score }) => (
          <PackageCard
            key={pkg.package_id}
            pkg={pkg}
            pkgName={pkgName}
            cityName={cityNames.get(pkg.city_id)}
            languageMatchScore={score}
            uiLang={uiLang}
          />
        ))}
      </div>

      {ranked.length === 0 && <p className="text-ink/50 mt-10">{t("packages.empty", uiLang)}</p>}
    </div>
  );
}

import Link from "next/link";
import type { TourPackage } from "@/lib/types";
import { t, tf, tLabel } from "@/lib/i18n";

export default function PackageCard({
  pkg,
  pkgName,
  cityName,
  languageMatchScore,
  uiLang,
}: {
  pkg: TourPackage;
  pkgName?: string;
  cityName?: string;
  languageMatchScore?: number;
  uiLang?: string;
}) {
  const lang = uiLang ?? "en";
  return (
    <Link
      href={`/packages/${pkg.package_id}`}
      className="group block border border-mist rounded-2xl bg-card overflow-hidden hover:border-route hover:shadow-[0_4px_0_0_theme(colors.route)] transition-all"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-route bg-route/10 px-2 py-1 rounded-full">
            {tLabel("theme", pkg.theme, lang)}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-brass">
            {tLabel("tier", pkg.tier, lang)}
          </span>
        </div>

        <h3 className="font-display text-xl text-ink leading-snug group-hover:text-route transition-colors">
          {pkgName ?? pkg.name}
        </h3>
        {cityName && <p className="text-sm text-ink/50 mt-1">{cityName}</p>}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink/60">
            {tf("packages.duration", lang, { d: pkg.duration_days, n: pkg.duration_nights })}
          </p>
          {!!languageMatchScore && languageMatchScore > 0 && (
            <span className="text-xs text-route flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-route" />
              {t("packages.matchesLanguage", lang)}
            </span>
          )}
        </div>

        <div className="route-divider my-4" />

        <div className="flex items-end justify-between">
          <span className="text-xs text-ink/50">{t("packages.from", lang)}</span>
          <span className="font-mono text-lg text-ink">
            {pkg.currency} {Number(pkg.base_price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </Link>
  );
}
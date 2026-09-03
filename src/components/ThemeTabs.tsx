import Link from "next/link";
import { PACKAGE_THEMES } from "@/lib/enums";
import { t, tLabel } from "@/lib/i18n";

export default function ThemeTabs({ activeTheme, uiLang = "en" }: { activeTheme?: string; uiLang?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/packages"
        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
          !activeTheme ? "bg-ink text-paper border-ink" : "border-mist text-ink/70 hover:border-route"
        }`}
      >
        {t("theme.all", uiLang)}
      </Link>
      {PACKAGE_THEMES.map((theme) => (
        <Link
          key={theme}
          href={`/packages?theme=${theme}`}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            activeTheme === theme ? "bg-ink text-paper border-ink" : "border-mist text-ink/70 hover:border-route"
          }`}
        >
          {tLabel("theme", theme, uiLang)}
        </Link>
      ))}
    </div>
  );
}
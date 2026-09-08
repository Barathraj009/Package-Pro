import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getUser } from "@/lib/db/queries";
import { getEffectivePreferences } from "@/lib/preferences";
import { t, resolveUiLanguage } from "@/lib/i18n";

export default function Header() {
  const userId = getCurrentUserId();
  const user = userId ? getUser(userId) : undefined;
  const prefs = userId ? getEffectivePreferences(userId) : null;
  const uiLang = prefs ? resolveUiLanguage(prefs.preferredLanguages) : "en";

  return (
    <header className="border-b border-mist bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/packages" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-stamp group-hover:scale-125 transition-transform" />
          <span className="font-display text-xl tracking-tight text-ink">PackagePro</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/packages" className="hover:text-route transition-colors">
            {t("nav.packages", uiLang)}
          </Link>
          <Link href="/build" className="hover:text-route transition-colors">
            {t("nav.build", uiLang)}
          </Link>
          {userId && (
            <Link href="/preferences" className="hover:text-route transition-colors">
              {t("nav.preferences", uiLang)}
            </Link>
          )}
          {userId && (
            <Link href="/bookings" className="hover:text-route transition-colors">
              {t("booking.myTrips", uiLang)}
            </Link>
          )}
          <Link
            href={userId ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-full border border-mist px-3 py-1.5 hover:border-route transition-colors"
          >
            {user ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-route" />
                <span>{user.display_name}</span>
              </>
            ) : (
              <span>{t("nav.login", uiLang)}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

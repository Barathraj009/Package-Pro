import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getUser } from "@/lib/db/queries";
import { getEffectivePreferences } from "@/lib/preferences";
import { resolveUiLanguage, t, tf } from "@/lib/i18n";
import LogoutButton from "./LogoutButton";

export default function AccountPage() {
  const userId = getCurrentUserId();
  const user = userId ? getUser(userId) : undefined;
  const prefs = userId ? getEffectivePreferences(userId) : null;
  const uiLang = prefs ? resolveUiLanguage(prefs.preferredLanguages) : "en";

  if (!userId || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60 mb-4">{t("booking.loginFirst", uiLang)}</p>
        <Link href="/login" className="text-route underline underline-offset-4">
          {t("login.pick", uiLang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">{t("account.title", uiLang)}</h1>
      <p className="text-ink/60 mb-8">{tf("account.welcomeBack", uiLang, { name: user.display_name })}</p>

      <div className="border border-mist rounded-2xl bg-card p-6 space-y-4">
        <div>
          <p className="text-xs text-ink/50 uppercase tracking-wider">{t("account.userId", uiLang)}</p>
          <p className="font-mono text-sm text-ink">{user.user_id}</p>
        </div>
        <div>
          <p className="text-xs text-ink/50 uppercase tracking-wider">{t("account.segment", uiLang)}</p>
          <p className="text-sm text-ink">{user.segment}</p>
        </div>
        <div className="route-divider my-4" />
        <div className="flex flex-wrap gap-3">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 border border-mist px-5 py-2.5 rounded-full text-sm hover:border-route transition-colors"
          >
            {t("booking.myTrips", uiLang)}
          </Link>
          <Link
            href="/preferences"
            className="inline-flex items-center gap-2 border border-mist px-5 py-2.5 rounded-full text-sm hover:border-route transition-colors"
          >
            {t("nav.preferences", uiLang)}
          </Link>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 bg-route text-paper px-5 py-2.5 rounded-full text-sm hover:bg-route-dark transition-colors"
          >
            {t("nav.build", uiLang)}
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <LogoutButton uiLang={uiLang} />
      </div>
    </div>
  );
}
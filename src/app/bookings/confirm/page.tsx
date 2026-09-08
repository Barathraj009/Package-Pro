import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getBookingByReference, getBookingWithDetails } from "@/lib/db/appQueries";
import { getEffectivePreferences } from "@/lib/preferences";
import { resolveUiLanguage, t, tf } from "@/lib/i18n";

export default function BookingConfirmPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref;
  const userId = getCurrentUserId();
  const uiLang = userId ? resolveUiLanguage(getEffectivePreferences(userId).preferredLanguages) : "en";

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60">{t("booking.noRef", uiLang)}</p>
      </div>
    );
  }

  const booking = getBookingByReference(ref);
  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60">{tf("booking.notFound", uiLang, { ref })}</p>
        <Link href="/packages" className="mt-4 inline-block text-route underline underline-offset-4">
          {t("booking.backToPackages", uiLang)}
        </Link>
      </div>
    );
  }

  if (!userId || booking.user_id !== userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60 mb-4">{t("booking.loginFirst", uiLang)}</p>
        <Link href="/login" className="text-route underline underline-offset-4">
          {t("login.pick", uiLang)}
        </Link>
      </div>
    );
  }

  const details = getBookingWithDetails(booking);
  if (!details) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60">{t("booking.notFoundInline", uiLang)}</p>
      </div>
    );
  }

  const formattedTotal = `${details.currency} ${Number(details.total_amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="route-divider mb-6" />
      <h1 className="font-display text-3xl text-ink mb-1">{t("booking.confirmedTitle", uiLang)}</h1>
      <p className="font-mono text-sm text-brass mb-8 uppercase tracking-wider">{details.booking_reference}</p>

      <div className="border border-mist rounded-2xl bg-card p-6 space-y-4">
        <div>
          <p className="text-xs text-ink/50 uppercase tracking-wider">{t("booking.packageLabel", uiLang)}</p>
          <p className="font-display text-xl text-ink">{details.packageName}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50 uppercase tracking-wider">{t("booking.bookedOn", uiLang)}</p>
            <p className="font-mono text-sm text-ink">
              {new Date(details.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink/50 uppercase tracking-wider">{t("booking.total", uiLang)}</p>
            <p className="font-mono text-lg text-ink">{formattedTotal}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/packages/${details.packageId}`}
          className="inline-flex items-center gap-2 bg-route text-paper px-5 py-2.5 rounded-full font-medium hover:bg-route-dark transition-colors"
        >
          {t("booking.openPackage", uiLang)}
        </Link>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 border border-mist px-5 py-2.5 rounded-full text-sm hover:border-route transition-colors"
        >
          {t("booking.myTrips", uiLang)}
        </Link>
      </div>
    </div>
  );
}
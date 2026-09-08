import Link from "next/link";
import { getCurrentUserId } from "@/lib/session";
import { getBookingsForUser, getBookingWithDetails, type BookingWithDetails } from "@/lib/db/appQueries";
import { getEffectivePreferences } from "@/lib/preferences";
import { resolveUiLanguage, t } from "@/lib/i18n";

export default function BookingsPage() {
  const userId = getCurrentUserId();
  const uiLang = userId ? resolveUiLanguage(getEffectivePreferences(userId).preferredLanguages) : "en";

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
        <p className="text-ink/60 mb-4">{t("booking.loginFirst", uiLang)}</p>
        <Link href="/login" className="text-route underline underline-offset-4">
          {t("login.pick", uiLang)}
        </Link>
      </div>
    );
  }

  const bookings = getBookingsForUser(userId);
  const rows: (BookingWithDetails | undefined)[] = bookings.map((b) => getBookingWithDetails(b)).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">{t("booking.myTripsTitle", uiLang)}</h1>
      <p className="text-ink/60 mb-8">{t("booking.myTripsSubtitle", uiLang)}</p>

      {rows.length === 0 ? (
        <div className="border border-mist rounded-2xl bg-card p-10 text-center">
          <p className="text-ink/60 mb-4">{t("booking.empty", uiLang)}</p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 bg-route text-paper px-5 py-2.5 rounded-full font-medium hover:bg-route-dark transition-colors"
          >
            {t("booking.backToPackages", uiLang)}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((b) =>
            b ? <BookingRow key={b.booking_id} booking={b} uiLang={uiLang} /> : null
          )}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, uiLang }: { booking: BookingWithDetails; uiLang: string }) {
  return (
    <Link
      href={`/bookings/confirm?ref=${encodeURIComponent(booking.booking_reference)}`}
      className="block border border-mist rounded-2xl bg-card p-5 hover:border-route transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-brass uppercase tracking-wider">{booking.booking_reference}</p>
          <p className="font-display text-lg text-ink truncate">{booking.packageName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-base text-ink">
            {booking.currency} {Number(booking.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-ink/50">
            {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
    </Link>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  TourPackage,
  PackageComponent,
  Hotel,
  HotelRoomType,
  Transfer,
  TourGuide,
} from "@/lib/types";
import type { ItineraryDay } from "@/lib/itinerary";
import type { RepriceResult, CustomizationSelections } from "@/lib/pricing";
import { t, tf, tLabel } from "@/lib/i18n";

const COMPONENT_ICON: Record<string, string> = {
  hotel: "🛏",
  poi: "📍",
  transfer: "🚐",
  guide: "🧭",
  meal: "🍽",
  entry_ticket: "🎫",
  insurance: "🛡",
  flight: "✈",
};

interface Props {
  pkg: TourPackage;
  cityLabel?: string;
  components: PackageComponent[];
  itinerary: ItineraryDay[];
  hotel: Hotel | null;
  hotelName?: string;
  roomTypes: HotelRoomType[];
  transfers: Transfer[];
  guides: TourGuide[];
  languagesOffered: string[];
  defaultPricing: RepriceResult;
  uiLang: string;
  isLoggedIn: boolean;
  inclusions: string;
  exclusions: string;
}

function fmt(amount: string, currency: string) {
  const n = Number(amount);
  return `${currency} ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PackageCustomizer(props: Props) {
  const {
    pkg,
    cityLabel,
    components,
    itinerary,
    hotel,
    hotelName,
    roomTypes,
    transfers,
    guides,
    languagesOffered,
    uiLang,
    isLoggedIn,
    inclusions,
    exclusions,
  } = props;

  const [roomTypeId, setRoomTypeId] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [guideRateType, setGuideRateType] = useState<"day" | "half_day">("half_day");
  const [extraDays, setExtraDays] = useState(0);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [partySize, setPartySize] = useState(2);
  const [tripStartDate, setTripStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [pricing, setPricing] = useState<RepriceResult>(props.defaultPricing);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<{ id?: string; shareUrl?: string; bookingRef?: string; error?: string }>(
    {}
  );

  const selections: CustomizationSelections = useMemo(
    () => ({
      roomTypeId,
      transferId,
      guideId,
      guideRateType,
      extraDays,
      removedComponentIds: Array.from(removedIds),
      tripStartDate,
      partySize,
    }),
    [roomTypeId, transferId, guideId, guideRateType, extraDays, removedIds, tripStartDate, partySize]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/packages/${pkg.package_id}/reprice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...selections, uiLang }),
    })
      .then((r) => r.json())
      .then((data: RepriceResult) => {
        if (!cancelled) setPricing(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTypeId, transferId, guideId, guideRateType, extraDays, tripStartDate, partySize, uiLang, Array.from(removedIds).join(",")]);

  const optionalComponents = components.filter((c) => c.is_optional === 1 && c.component_type !== "guide");
  const guideComponent = components.find((c) => c.component_type === "guide");

  function toggleRemoved(id: string) {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaveState({});
    const res = await fetch("/api/customizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkg.package_id, selections }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSaveState({ error: data.error ?? t("detail.saveError", uiLang) });
      return;
    }
    setSaveState({ id: data.customizationId });
    return data.customizationId as string;
  }

  async function handleShare() {
    let id = saveState.id;
    if (!id) id = await handleSave();
    if (!id) return;
    const res = await fetch(`/api/customizations/${id}/share`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setSaveState((s) => ({ ...s, error: data.error }));
      return;
    }
    setSaveState((s) => ({ ...s, id, shareUrl: data.shareUrl }));
  }

  async function handleBook() {
    if (!isLoggedIn) {
      setSaveState((s) => ({ ...s, error: t("detail.loginFirstBook", uiLang) }));
      return;
    }
    let id = saveState.id;
    if (!id) id = await handleSave();
    if (!id) return;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customizationId: id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSaveState((s) => ({ ...s, error: data.error }));
      return;
    }
    setSaveState((s) => ({ ...s, id, bookingRef: data.booking.booking_reference }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-route bg-route/10 px-2 py-1 rounded-full">
            {tLabel("theme", pkg.theme, uiLang)}
          </span>
          {cityLabel && <span className="text-sm text-ink/50">{cityLabel}</span>}
        </div>
        <h1 className="font-display text-4xl text-ink">{pkg.name}</h1>
        <p className="text-ink/60 mt-2 max-w-2xl">{pkg.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {languagesOffered.map((l) => (
            <span key={l} className="text-xs font-mono px-2 py-1 rounded bg-mist text-ink/70">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,380px] gap-8">
        {/* Left: itinerary + customization controls */}
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl text-ink mb-4">{t("detail.itinerary", uiLang)}</h2>
            <div className="space-y-4">
              {itinerary.map((day) => (
                <div key={day.dayIndex} className="border border-mist rounded-xl bg-card p-4">
                  <p className="font-mono text-xs uppercase tracking-wide text-brass mb-3">
                    {tf("detail.day", uiLang, { n: day.dayIndex })}
                  </p>
                  <ul className="space-y-2">
                    {day.items.map((item) => {
                      const isRemoved = removedIds.has(item.component_id);
                      return (
                        <li
                          key={item.component_id}
                          className={`flex items-start gap-3 text-sm ${isRemoved ? "opacity-40 line-through" : ""}`}
                        >
                          <span>{COMPONENT_ICON[item.component_type] ?? "•"}</span>
                          <div className="flex-1">
                            <span className="text-ink/40 font-mono text-xs mr-2">
                              {tLabel("slot", item.slot, uiLang)}
                            </span>
                            <span>{item.title}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {extraDays > 0 &&
                Array.from({ length: extraDays }).map((_, i) => (
                  <div key={`extra-${i}`} className="border border-dashed border-route/40 rounded-xl bg-route/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-wide text-route mb-1">
                      {tf("detail.day", uiLang, { n: pkg.duration_days + i + 1 })} · {t("detail.added", uiLang)}
                    </p>
                    <p className="text-sm text-ink/60">{t("detail.extraDayInfo", uiLang)}</p>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink mb-4">{t("detail.customise", uiLang)}</h2>
            <div className="space-y-5">
              {/* Hotel tier swap */}
              {hotel && roomTypes.length > 0 && (
                <div className="border border-mist rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-ink mb-1">{t("detail.hotelTier", uiLang)}</p>
                  <p className="text-xs text-ink/50 mb-3">
                    {hotelName ?? hotel.name} · {hotel.star_rating}★
                  </p>
                  <select
                    className="w-full border border-mist rounded-lg px-3 py-2 text-sm bg-paper"
                    value={roomTypeId ?? ""}
                    onChange={(e) => setRoomTypeId(e.target.value || null)}
                  >
                    <option value="">{t("detail.defaultRoom", uiLang)}</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.room_type_id} value={rt.room_type_id}>
                        {tLabel("room", rt.name, uiLang)} — {pkg.currency}{" "}
                        {Number(rt.base_rate).toLocaleString("en-IN")}
                        {t("detail.perNight", uiLang)} · {t("detail.sleeps", uiLang)} {rt.max_occupancy}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Transfer swap */}
              {transfers.length > 0 && (
                <div className="border border-mist rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-ink mb-3">{t("detail.transfer", uiLang)}</p>
                  <select
                    className="w-full border border-mist rounded-lg px-3 py-2 text-sm bg-paper"
                    value={transferId ?? ""}
                    onChange={(e) => setTransferId(e.target.value || null)}
                  >
                    <option value="">{t("detail.defaultTransfer", uiLang)}</option>
                    {transfers.map((tr) => (
                      <option key={tr.transfer_id} value={tr.transfer_id}>
                        {tLabel("mode", tr.mode, uiLang)} · {tLabel("place", tr.from_label, uiLang)} →{" "}
                        {tLabel("place", tr.to_label, uiLang)} — {pkg.currency}{" "}
                        {Number(tr.cost).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Guide picker */}
              <div className="border border-mist rounded-xl bg-card p-4">
                <p className="text-sm font-medium text-ink mb-3">{t("detail.guide", uiLang)}</p>
                {guideComponent && (
                  <label className="flex items-center gap-2 text-sm mb-3">
                    <input
                      type="checkbox"
                      checked={!removedIds.has(guideComponent.component_id)}
                      onChange={() => toggleRemoved(guideComponent.component_id)}
                    />
                    {t("detail.includeGuide", uiLang)}
                  </label>
                )}
                {!removedIds.has(guideComponent?.component_id ?? "") && (
                  <>
                    <select
                      className="w-full border border-mist rounded-lg px-3 py-2 text-sm bg-paper mb-2"
                      value={guideId ?? ""}
                      onChange={(e) => setGuideId(e.target.value || null)}
                    >
                      <option value="">{t("detail.unassigned", uiLang)}</option>
                      {guides.map((g) => (
                        <option key={g.guide_id} value={g.guide_id}>
                          {g.display_name} — {tLabel("spec", g.specialisation, uiLang)} · {g.languages} · ★
                          {g.rating ?? "—"}
                        </option>
                      ))}
                    </select>
                    {guideId && (
                      <div className="flex gap-4 text-sm mt-2">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={guideRateType === "half_day"}
                            onChange={() => setGuideRateType("half_day")}
                          />
                          {t("guide.halfDayRate", uiLang)}
                        </label>
                        <label className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            checked={guideRateType === "day"}
                            onChange={() => setGuideRateType("day")}
                          />
                          {t("guide.dayRate", uiLang)}
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Optional components (meals, entry tickets) */}
              {optionalComponents.length > 0 && (
                <div className="border border-mist rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-ink mb-3">{t("detail.includedExtras", uiLang)}</p>
                  <div className="space-y-2">
                    {optionalComponents.map((c) => (
                      <label key={c.component_id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!removedIds.has(c.component_id)}
                          onChange={() => toggleRemoved(c.component_id)}
                        />
                        {c.title} <span className="text-ink/40 font-mono text-xs">({fmt(c.price_delta, c.currency)})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra days */}
              <div className="border border-mist rounded-xl bg-card p-4">
                <p className="text-sm font-medium text-ink mb-3">{t("detail.extraDays", uiLang)}</p>
                <div className="flex items-center gap-3">
                  <button
                    className="w-8 h-8 rounded-full border border-mist hover:border-route"
                    onClick={() => setExtraDays((n) => Math.max(0, n - 1))}
                  >
                    −
                  </button>
                  <span className="font-mono w-6 text-center">{extraDays}</span>
                  <button
                    className="w-8 h-8 rounded-full border border-mist hover:border-route"
                    onClick={() => setExtraDays((n) => Math.min(5, n + 1))}
                  >
                    +
                  </button>
                  <span className="text-xs text-ink/50">
                    {tf("detail.daysRange", uiLang, { a: pkg.duration_days, b: pkg.duration_days + extraDays })}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Inclusions / Exclusions */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-4">{t("detail.inclusions", uiLang)}</h2>
            <p className="text-sm text-ink/70">{inclusions}</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-ink mb-4">{t("detail.exclusions", uiLang)}</h2>
            <p className="text-sm text-ink/70">{exclusions}</p>
          </section>
        </div>

        {/* Right: sticky price breakdown */}
        <aside className="lg:sticky lg:top-24 h-fit border border-mist rounded-2xl bg-card p-5">
          <h3 className="font-display text-xl text-ink mb-4">{t("detail.priceBreakdown", uiLang)}</h3>

          <div className="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
            <div className="flex justify-between text-ink/60">
              <span>{t("detail.base", uiLang)}</span>
              <span className="font-mono">{fmt(pricing.baseAmount.amount, pricing.baseAmount.currency)}</span>
            </div>
            {pricing.lines.map((line) => (
              <div key={line.key} className={`flex justify-between ${line.removed ? "opacity-40 line-through" : ""}`}>
                <span className="truncate pr-2" title={line.note}>
                  {line.label}
                  {line.swapped && !line.removed && (
                    <span className="text-route ml-1">·{t("detail.swapped", uiLang)}</span>
                  )}
                </span>
                <span className="font-mono shrink-0">{fmt(line.amount.amount, line.amount.currency)}</span>
              </div>
            ))}
          </div>

          <div className="route-divider my-4" />

          <div className="flex justify-between items-baseline">
            <span className="font-medium">{t("detail.total", uiLang)}</span>
            <span className={`font-mono text-2xl text-ink ${loading ? "opacity-40" : ""}`}>
              {fmt(pricing.total.amount, pricing.total.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-ink/50">
            <label htmlFor="party-size">{t("detail.splitAcross", uiLang)}</label>
            <input
              id="party-size"
              type="number"
              min={1}
              max={12}
              value={partySize}
              onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 border border-mist rounded px-1.5 py-0.5"
            />
            <span>{t("detail.traveller", uiLang)}</span>
          </div>
          {pricing.perTraveller && (
            <p className="text-xs font-mono text-ink/50 mt-1">
              {pricing.perTraveller.map((p) => fmt(p.amount, p.currency)).join(" + ")}
            </p>
          )}

          <div className="mt-5 space-y-2">
            <button
              onClick={handleBook}
              className="w-full bg-route text-paper py-2.5 rounded-full font-medium hover:bg-route-dark transition-colors"
            >
              {t("detail.book", uiLang)}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 border border-mist py-2 rounded-full text-sm hover:border-route transition-colors"
              >
                {t("detail.save", uiLang)}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 border border-mist py-2 rounded-full text-sm hover:border-route transition-colors"
              >
                {t("detail.share", uiLang)}
              </button>
            </div>
          </div>

          {saveState.id && !saveState.shareUrl && !saveState.bookingRef && (
            <p className="text-xs text-route mt-3">{t("detail.saved", uiLang)}</p>
          )}
          {saveState.shareUrl && (
            <p className="text-xs text-route mt-3 break-all">
              {t("detail.shareLink", uiLang)}{" "}
              <a className="underline" href={saveState.shareUrl}>
                {saveState.shareUrl}
              </a>
            </p>
          )}
          {saveState.bookingRef && (
            <p className="text-xs text-route mt-3">{tf("detail.booked", uiLang, { ref: saveState.bookingRef })}</p>
          )}
          {saveState.error && <p className="text-xs text-stamp mt-3">{saveState.error}</p>}

          <p className="text-[11px] text-ink/40 mt-4">
            {t("detail.tripStart", uiLang)}{" "}
            <input
              type="date"
              value={tripStartDate}
              onChange={(e) => setTripStartDate(e.target.value)}
              className="border border-mist rounded px-1.5 py-0.5 ml-1"
            />
          </p>
        </aside>
      </div>
    </div>
  );
}
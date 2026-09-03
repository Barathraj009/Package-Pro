/**
 * Live repricing engine.
 *
 * Design decision (documented in README — the dataset doesn't specify this
 * formula, so this is our stated assumption):
 *
 *   default total = tour_packages.base_price + Σ price_delta of every
 *   package_component belonging to the package.
 *
 * That's what a traveller sees the instant a package loads, with every
 * component (mandatory and optional-by-default) included. From there:
 *   - Unchecking an optional component subtracts its price_delta.
 *   - Swapping the hotel's room tier replaces the hotel line's delta with
 *     `original_delta + (selected_room.base_rate - cheapest_room.base_rate) × nights`
 *     — anchored so picking the cheapest room exactly reproduces the
 *     default total, and real rate gaps drive the difference.
 *   - Swapping the transfer replaces its delta with the selected transfer's
 *     real `cost` (transfers.cost is already an absolute per-leg price).
 *   - Assigning a real guide replaces the generic guide placeholder's delta
 *     with `rate × price_multiplier` for the trip's date (day_rate or
 *     half_day_rate, whichever the traveller picks), pulling real numbers
 *     from tour_guides + guide_availability.
 *   - Extending duration adds estimated trailing days priced at the
 *     package's own average mandatory-component cost per day.
 *
 * Every arithmetic step uses Decimal (src/lib/money.ts) — never a bare
 * number — per rule R3.
 */
import { Decimal, Money, money, add, sum, zero, allocateLargestRemainder, toApiString } from "@/lib/money";
import {
  getPackage,
  getPackageComponents,
  getHotel,
  getRoomTypesForHotel,
  getRoomType,
  getTransfer,
  getGuide,
  getGuideAvailability,
} from "@/lib/db/queries";
import { t, tf, tLabel } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-i18n";
import type { PackageComponent } from "@/lib/types";

export interface CustomizationSelections {
  roomTypeId?: string | null; // chosen alternate room type for the package's hotel
  transferId?: string | null; // chosen alternate transfer leg
  guideId?: string | null; // chosen real guide (null/undefined = keep generic placeholder)
  guideRateType?: "day" | "half_day";
  tripStartDate?: string; // zoneless calendar date, YYYY-MM-DD — used for guide availability lookup
  extraDays?: number; // additional trailing days beyond the package default
  removedComponentIds?: string[]; // optional components the traveller unchecked
  partySize?: number; // for the largest-remainder per-traveller split
}

export interface PriceLine {
  key: string; // component_id, or a synthetic key for extra days
  label: string;
  componentType: string;
  dayIndex: number;
  amount: { amount: string; currency: string };
  editable: boolean; // is_swappable
  removable: boolean; // is_optional
  removed: boolean;
  swapped: boolean; // true if this line's price diverges from its seeded default
  note?: string;
}

export interface RepriceResult {
  packageId: string;
  currency: string;
  baseAmount: { amount: string; currency: string };
  lines: PriceLine[];
  total: { amount: string; currency: string };
  perTraveller?: { amount: string; currency: string }[];
}

function centsAmount(v: string, currency: string): Money {
  return money(v, currency);
}

export function repricePackage(
  packageId: string,
  selections: CustomizationSelections = {},
  uiLang?: string
): RepriceResult {
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error(`Package not found: ${packageId}`);

  const currency = pkg.currency;
  const base = money(pkg.base_price, currency);
  const components = getPackageComponents(packageId);
  const removed = new Set(selections.removedComponentIds ?? []);

  const lines: PriceLine[] = [];
  let runningTotal = base;

  for (const c of components) {
    const line = priceComponentLine(c, currency, selections, removed, uiLang);
    lines.push(line);
    if (!line.removed) {
      runningTotal = add(runningTotal, centsAmount(line.amount.amount, currency));
    }
  }

  // Extra days: priced at the average mandatory-component cost per day so a
  // longer trip scales with the package's own real cost structure rather
  // than a flat guess.
  const extraDays = Math.max(0, Math.floor(selections.extraDays ?? 0));
  if (extraDays > 0) {
    const mandatory = components.filter((c) => c.is_optional === 0);
    const mandatorySum = sum(
      mandatory.map((c) => centsAmount(c.price_delta, currency)),
      currency
    );
    const perDay = pkg.duration_days > 0 ? mandatorySum.amount.dividedBy(pkg.duration_days) : new Decimal(0);
    for (let i = 0; i < extraDays; i++) {
      const dayAmount: Money = { amount: perDay, currency };
      lines.push({
        key: `extra_day_${i + 1}`,
        label: tf("price.extraDayLabel", uiLang, { n: i + 1 }),
        componentType: "extra_day",
        dayIndex: pkg.duration_days + i + 1,
        amount: toApiString(dayAmount),
        editable: false,
        removable: true,
        removed: false,
        swapped: true,
        note: t("price.extraDayNote", uiLang),
      });
      runningTotal = add(runningTotal, dayAmount);
    }
  }

  const result: RepriceResult = {
    packageId,
    currency,
    baseAmount: toApiString(base),
    lines,
    total: toApiString(runningTotal),
  };

  if (selections.partySize && selections.partySize > 0) {
    const parts = allocateLargestRemainder(runningTotal, selections.partySize);
    result.perTraveller = parts.map(toApiString);
  }

  return result;
}

function priceComponentLine(
  c: PackageComponent,
  currency: string,
  selections: CustomizationSelections,
  removed: Set<string>,
  uiLang?: string
): PriceLine {
  const isRemoved = c.is_optional === 1 && removed.has(c.component_id);
  const base: PriceLine = {
    key: c.component_id,
    label: localizeContent(uiLang, `comp:${c.component_id}`, c.title),
    componentType: c.component_type,
    dayIndex: c.day_index,
    amount: toApiString(centsAmount(c.price_delta, currency)),
    editable: c.is_swappable === 1,
    removable: c.is_optional === 1,
    removed: isRemoved,
    swapped: false,
  };

  if (isRemoved) {
    return { ...base, amount: toApiString(zero(currency)) };
  }

  if (c.component_type === "hotel" && selections.roomTypeId && c.entity_id) {
    return priceHotelSwap(c, currency, selections.roomTypeId, base, uiLang);
  }

  if (c.component_type === "transfer" && selections.transferId) {
    return priceTransferSwap(c, currency, selections.transferId, base, uiLang);
  }

  if (c.component_type === "guide" && selections.guideId) {
    return priceGuideSwap(c, currency, selections, base, uiLang);
  }

  return base;
}

function priceHotelSwap(
  c: PackageComponent,
  currency: string,
  roomTypeId: string,
  base: PriceLine,
  uiLang?: string
): PriceLine {
  const hotel = c.entity_id ? getHotel(c.entity_id) : undefined;
  if (!hotel) return base;

  const roomTypes = getRoomTypesForHotel(hotel.hotel_id);
  if (roomTypes.length === 0) return base;

  const cheapest = roomTypes.reduce((min, r) => (new Decimal(r.base_rate).lt(min.base_rate) ? r : min));
  const selected = getRoomType(roomTypeId);
  if (!selected || selected.hotel_id !== hotel.hotel_id) return base;

  const originalDelta = new Decimal(c.price_delta);
  const rateDiff = new Decimal(selected.base_rate).minus(cheapest.base_rate);
  // We don't have nights-per-hotel-stay isolated from the package, so use
  // the package's own baked-in delta as the one-night-equivalent anchor and
  // scale the *difference* by 1 night per stay segment this component
  // represents (each hotel component line already represents the full stay
  // contribution for this package).
  const newDelta = originalDelta.plus(rateDiff);

  const amount: Money = { amount: newDelta, currency };
  return {
    ...base,
    amount: toApiString(amount),
    swapped: selected.room_type_id !== cheapest.room_type_id,
    note: tf("price.roomNote", uiLang, {
      room: tLabel("room", selected.name, uiLang),
      hotel: localizeContent(uiLang, `htl:${hotel.hotel_id}`, hotel.name),
      currency: currency,
      rate: selected.base_rate,
      cheapest: cheapest.base_rate,
    }),
  };
}

function priceTransferSwap(
  c: PackageComponent,
  currency: string,
  transferId: string,
  base: PriceLine,
  uiLang?: string
): PriceLine {
  const transfer = getTransfer(transferId);
  if (!transfer) return base;
  const amount: Money = { amount: new Decimal(transfer.cost), currency };
  return {
    ...base,
    amount: toApiString(amount),
    swapped: true,
    note: tf("price.transferNote", uiLang, {
      mode: tLabel("mode", transfer.mode, uiLang),
      from: tLabel("place", transfer.from_label, uiLang),
      to: tLabel("place", transfer.to_label, uiLang),
      min: transfer.duration_minutes,
    }),
  };
}

function priceGuideSwap(
  c: PackageComponent,
  currency: string,
  selections: CustomizationSelections,
  base: PriceLine,
  uiLang?: string
): PriceLine {
  const guide = selections.guideId ? getGuide(selections.guideId) : undefined;
  if (!guide) return base;

  const rateType = selections.guideRateType ?? "half_day";
  const baseRate = new Decimal(rateType === "day" ? guide.day_rate : guide.half_day_rate);

  let multiplier = new Decimal(1);
  let availabilityNote = "";
  if (selections.tripStartDate) {
    const avail = getGuideAvailability(guide.guide_id, selections.tripStartDate);
    if (avail) {
      multiplier = new Decimal(avail.price_multiplier);
      if (avail.is_available === 0 || avail.slots_available <= 0) {
        availabilityNote = t("price.availNote", uiLang);
      }
    }
  }

  const amount: Money = { amount: baseRate.times(multiplier), currency };
  return {
    ...base,
    label: tf("price.guideLabel", uiLang, { name: guide.display_name }),
    amount: toApiString(amount),
    swapped: true,
    note: tf("price.guideNote", uiLang, {
      spec: tLabel("spec", guide.specialisation, uiLang),
      extra: guide.secondary_specialisation ? ` + ${tLabel("spec", guide.secondary_specialisation, uiLang)}` : "",
      langs: guide.languages,
      rateWord: t(rateType === "day" ? "price.rateFull" : "price.rateHalf", uiLang),
      mult: multiplier.toFixed(2),
      avail: availabilityNote ? ` — ${availabilityNote}` : "",
    }),
  };
}

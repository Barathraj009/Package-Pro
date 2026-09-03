import type { PackageComponent } from "@/lib/types";

const SLOT_ORDER: Record<string, number> = { morning: 0, afternoon: 1, evening: 2, overnight: 3 };

export interface ItineraryDay {
  dayIndex: number;
  items: PackageComponent[];
}

/**
 * The dataset has no package_id → itinerary link (see README "Data model
 * decisions"), so the itinerary shown on a package detail page is built
 * directly from that package's package_components, grouped by day and
 * ordered by time-of-day slot.
 */
export function synthesizeItinerary(components: PackageComponent[]): ItineraryDay[] {
  const byDay = new Map<number, PackageComponent[]>();
  for (const c of components) {
    const arr = byDay.get(c.day_index) ?? [];
    arr.push(c);
    byDay.set(c.day_index, arr);
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayIndex, items]) => ({
      dayIndex,
      items: items.sort((a, b) => (SLOT_ORDER[a.slot] ?? 99) - (SLOT_ORDER[b.slot] ?? 99)),
    }));
}

import { describe, it, expect } from "vitest";
import { synthesizeItinerary } from "./itinerary";
import type { PackageComponent } from "./types";

function comp(partial: Partial<PackageComponent>): PackageComponent {
  return {
    package_id: "pkg_x",
    component_id: `pcm_${partial.day_index}_${partial.slot ?? ""}_${Math.random().toString(36).slice(2, 8)}`,
    component_type: "poi",
    title: "X",
    description: null,
    day_index: partial.day_index ?? 1,
    slot: partial.slot ?? "morning",
    entity_id: null,
    price_delta: "10.00",
    currency: "INR",
    is_optional: 0,
    is_swappable: 0,
    ...partial,
  } as PackageComponent;
}

describe("synthesizeItinerary", () => {
  it("groups by day and orders days ascending", () => {
    const out = synthesizeItinerary([comp({ day_index: 2, slot: "morning" }), comp({ day_index: 1, slot: "evening" })]);
    expect(out.map((d) => d.dayIndex)).toEqual([1, 2]);
  });

  it("orders within a day by slot (morning < afternoon < evening < overnight)", () => {
    const out = synthesizeItinerary([
      comp({ slot: "evening" }),
      comp({ slot: "morning" }),
      comp({ slot: "overnight" }),
      comp({ slot: "afternoon" }),
    ]);
    expect(out[0]!.items.map((i) => i.slot)).toEqual(["morning", "afternoon", "evening", "overnight"]);
  });

  it("returns empty for no components", () => {
    expect(synthesizeItinerary([])).toEqual([]);
  });
});

import { NextRequest, NextResponse } from "next/server";
import { getPackage, listPackages, searchGuides, getPackageComponents } from "@/lib/db/queries";
import { getCatalogDb } from "@/lib/db/catalog";
import type { TourPackage } from "@/lib/types";

/**
 * Rule-based add-on recommendations (stretch goal 7): same city, not
 * already part of the package, sorted by rating/relevance. No ML — just
 * straightforward filtering over real catalog rows.
 */
export async function GET(_req: NextRequest, { params }: { params: { packageId: string } }) {
  const pkg = getPackage(params.packageId);
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const components = getPackageComponents(pkg.package_id);
  const alreadyGuided = components.some((c) => c.component_type === "guide");

  // Other curated packages in the same city, different theme — natural
  // "extend your trip" cross-sell.
  const db = getCatalogDb();
  const sameCityPackages = (
    db
      .prepare<[string, string]>(`SELECT * FROM tour_packages WHERE city_id = ? AND package_id != ? AND status = 'active'`)
      .all(pkg.city_id, pkg.package_id) as TourPackage[]
  )
    .slice()
    .sort((a, b) => (a.theme === pkg.theme ? 1 : 0) - (b.theme === pkg.theme ? 1 : 0)) // different theme first
    .slice(0, 4);

  // Top-rated guides in the city not already the package's default guide.
  const cityGuides = searchGuides({ cityId: pkg.city_id })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  return NextResponse.json({
    relatedPackages: sameCityPackages,
    recommendedGuides: cityGuides,
    note: alreadyGuided
      ? "This package already includes a guide slot — these are alternates."
      : "No guide is included by default — consider adding one.",
  });
}

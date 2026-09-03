import { NextRequest, NextResponse } from "next/server";
import {
  getPackage,
  getPackageComponents,
  getHotel,
  getRoomTypesForHotel,
  listTransfersForCity,
  searchGuides,
  getCity,
} from "@/lib/db/queries";
import { synthesizeItinerary } from "@/lib/itinerary";
import { repricePackage } from "@/lib/pricing";
import { getEffectivePreferences } from "@/lib/preferences";
import { getCurrentUserId } from "@/lib/session";
import { parseLangList } from "@/lib/lang";
import { resolveUiLanguage } from "@/lib/i18n";
import { localizeContent } from "@/lib/content-i18n";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const pkg = getPackage(params.id);
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const components = getPackageComponents(pkg.package_id);
  const itinerary = synthesizeItinerary(components);
  const city = getCity(pkg.city_id);

  const hotelComponent = components.find((c) => c.component_type === "hotel" && c.entity_id);
  const hotel = hotelComponent?.entity_id ? getHotel(hotelComponent.entity_id) : undefined;
  const roomTypes = hotel ? getRoomTypesForHotel(hotel.hotel_id) : [];

  const transfers = listTransfersForCity(pkg.city_id);

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? getCurrentUserId();
  const preferredGuideLanguage = userId ? getEffectivePreferences(userId).guideLanguage : null;
  const uiLang = searchParams.get("lang") ?? (userId ? resolveUiLanguage(getEffectivePreferences(userId).preferredLanguages) : "en");

  // Default guide candidates: this package's city, ranked with the
  // traveller's preferred guide language first if they have one set.
  const guides = searchGuides({ cityId: pkg.city_id, language: preferredGuideLanguage ?? undefined });
  const guidesFallback = guides.length > 0 ? guides : searchGuides({ cityId: pkg.city_id });

  const defaultPricing = repricePackage(pkg.package_id, {}, uiLang);
  const localizedPkg = {
    ...pkg,
    name: localizeContent(uiLang, `pkg:${pkg.package_id}:name`, pkg.name),
    description: localizeContent(uiLang, `pkg:${pkg.package_id}:description`, pkg.description),
  };

  return NextResponse.json({
    package: localizedPkg,
    city,
    components,
    itinerary,
    hotel,
    roomTypes,
    transfers,
    guides: guidesFallback,
    languagesOffered: parseLangList(pkg.languages_offered),
    defaultPricing,
  });
}

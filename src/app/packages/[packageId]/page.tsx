import { notFound } from "next/navigation";
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
import type { TourPackage } from "@/lib/types";
import PackageCustomizer from "./PackageCustomizer";

export default function PackageDetailPage({ params }: { params: { packageId: string } }) {
  const pkg = getPackage(params.packageId);
  if (!pkg) notFound();

  const userId = getCurrentUserId();
  const prefs = userId ? getEffectivePreferences(userId) : null;
  const uiLang = prefs ? resolveUiLanguage(prefs.preferredLanguages) : "en";

  const localizedPkg: TourPackage = {
    ...pkg,
    name: localizeContent(uiLang, `pkg:${pkg.package_id}:name`, pkg.name),
    description: localizeContent(uiLang, `pkg:${pkg.package_id}:description`, pkg.description),
  };
  const inclusions = localizeContent(uiLang, `pkg:${pkg.package_id}:inclusions`, pkg.inclusions);
  const exclusions = localizeContent(uiLang, `pkg:${pkg.package_id}:exclusions`, pkg.exclusions);

  const components = getPackageComponents(pkg.package_id).map((c) => ({
    ...c,
    title: localizeContent(uiLang, `comp:${c.component_id}`, c.title),
  }));
  const itinerary = synthesizeItinerary(components);
  const city = getCity(pkg.city_id);
  const cityLabel = city
    ? [
        localizeContent(uiLang, `cty:${city.city_id}`, city.name),
        city.state ? localizeContent(uiLang, `ctySt:${city.state.trim()}`, city.state) : "",
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const hotelComponent = components.find((c) => c.component_type === "hotel" && c.entity_id);
  const hotel = hotelComponent?.entity_id ? getHotel(hotelComponent.entity_id) : undefined;
  const roomTypes = hotel ? getRoomTypesForHotel(hotel.hotel_id) : [];
  const transfers = listTransfersForCity(pkg.city_id);

  const guides = searchGuides({ cityId: pkg.city_id, language: prefs?.guideLanguage ?? undefined });
  const guidesFallback = guides.length > 0 ? guides : searchGuides({ cityId: pkg.city_id });

  const defaultPricing = repricePackage(pkg.package_id, {}, uiLang);

  return (
    <PackageCustomizer
      pkg={localizedPkg}
      cityLabel={cityLabel}
      components={components}
      itinerary={itinerary}
      hotel={hotel ?? null}
      roomTypes={roomTypes}
      transfers={transfers}
      guides={guidesFallback}
      languagesOffered={parseLangList(pkg.languages_offered)}
      defaultPricing={defaultPricing}
      uiLang={uiLang}
      isLoggedIn={!!userId}
      inclusions={inclusions}
      exclusions={exclusions}
      hotelName={hotel ? localizeContent(uiLang, `htl:${hotel.hotel_id}`, hotel.name) : undefined}
    />
  );
}

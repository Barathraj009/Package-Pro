import { getCatalogDb } from "./catalog";
import type {
  TourPackage,
  PackageComponent,
  Hotel,
  HotelRoomType,
  TourGuide,
  GuideAvailability,
  Transfer,
  User,
  UserPreferences,
  City,
  Currency,
  Language,
} from "@/lib/types";

// ---- Packages -------------------------------------------------------------

export function listPackages(opts?: { theme?: string }): TourPackage[] {
  const db = getCatalogDb();
  if (opts?.theme) {
    return db
      .prepare<[string]>(`SELECT * FROM tour_packages WHERE status = 'active' AND theme = ? ORDER BY name`)
      .all(opts.theme) as TourPackage[];
  }
  return db.prepare(`SELECT * FROM tour_packages WHERE status = 'active' ORDER BY theme, name`).all() as TourPackage[];
}

export function getPackage(packageId: string): TourPackage | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM tour_packages WHERE package_id = ?`).get(packageId) as
    | TourPackage
    | undefined;
}

export function getPackageComponents(packageId: string): PackageComponent[] {
  const db = getCatalogDb();
  return db
    .prepare<[string]>(
      `SELECT * FROM package_components WHERE package_id = ? ORDER BY day_index, slot`
    )
    .all(packageId) as PackageComponent[];
}

// ---- Hotels -----------------------------------------------------------------

export function getHotel(hotelId: string): Hotel | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM hotels WHERE hotel_id = ?`).get(hotelId) as Hotel | undefined;
}

export function getRoomTypesForHotel(hotelId: string): HotelRoomType[] {
  const db = getCatalogDb();
  // base_rate is stored as TEXT (rule R3 — decimal-safe money), so a plain
  // ORDER BY sorts lexicographically ("1000.00" before "950.00"). Cast for
  // display ordering only — all real arithmetic still happens via Decimal.
  return db
    .prepare<[string]>(
      `SELECT * FROM hotel_room_types WHERE hotel_id = ? AND status = 'active' ORDER BY CAST(base_rate AS REAL)`
    )
    .all(hotelId) as HotelRoomType[];
}

export function getRoomType(roomTypeId: string): HotelRoomType | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM hotel_room_types WHERE room_type_id = ?`).get(roomTypeId) as
    | HotelRoomType
    | undefined;
}

// ---- Guides -------------------------------------------------------------------

export interface GuideSearchFilters {
  cityId?: string;
  language?: string; // BCP-47 — matches if present anywhere in guide.languages
  specialisation?: string;
  forDate?: string; // zoneless calendar date — filters to guides available that day
}

export function searchGuides(filters: GuideSearchFilters): TourGuide[] {
  const db = getCatalogDb();
  const clauses: string[] = [`status = 'active'`];
  const params: (string | number)[] = [];

  if (filters.cityId) {
    clauses.push(`city_id = ?`);
    params.push(filters.cityId);
  }
  if (filters.specialisation) {
    clauses.push(`(specialisation = ? OR secondary_specialisation = ?)`);
    params.push(filters.specialisation, filters.specialisation);
  }
  if (filters.language) {
    // languages is a comma-separated BCP-47 list; match as a delimited token.
    clauses.push(`(',' || languages || ',') LIKE ?`);
    params.push(`%,${filters.language},%`);
  }

  let guides = db
    .prepare(`SELECT * FROM tour_guides WHERE ${clauses.join(" AND ")} ORDER BY rating DESC`)
    .all(...params) as TourGuide[];

  if (filters.forDate) {
    const availByGuide = new Set(
      (
        db
          .prepare<[string]>(
            `SELECT guide_id FROM guide_availability WHERE for_date = ? AND is_available = 1 AND slots_available > 0`
          )
          .all(filters.forDate) as { guide_id: string }[]
      ).map((r) => r.guide_id)
    );
    guides = guides.filter((g) => availByGuide.has(g.guide_id));
  }

  return guides;
}

export function getGuide(guideId: string): TourGuide | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM tour_guides WHERE guide_id = ?`).get(guideId) as TourGuide | undefined;
}

export function getGuideAvailability(guideId: string, forDate: string): GuideAvailability | undefined {
  const db = getCatalogDb();
  return db
    .prepare<[string, string]>(`SELECT * FROM guide_availability WHERE guide_id = ? AND for_date = ?`)
    .get(guideId, forDate) as GuideAvailability | undefined;
}

export function getGuideAvailabilityRange(guideId: string, fromDate: string, toDate: string): GuideAvailability[] {
  const db = getCatalogDb();
  return db
    .prepare<[string, string, string]>(
      `SELECT * FROM guide_availability WHERE guide_id = ? AND for_date >= ? AND for_date <= ? ORDER BY for_date`
    )
    .all(guideId, fromDate, toDate) as GuideAvailability[];
}

// ---- Transfers -------------------------------------------------------------

export function listTransfersForCity(cityId: string): Transfer[] {
  const db = getCatalogDb();
  // Same TEXT-sort caveat as room rates above — cast for display order.
  return db
    .prepare<[string]>(
      `SELECT * FROM transfers WHERE city_id = ? AND status = 'active' ORDER BY CAST(cost AS REAL)`
    )
    .all(cityId) as Transfer[];
}

export function getTransfer(transferId: string): Transfer | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM transfers WHERE transfer_id = ?`).get(transferId) as
    | Transfer
    | undefined;
}

// ---- Users / preferences ----------------------------------------------------

export function listDemoUsers(limit = 24): User[] {
  const db = getCatalogDb();
  // A spread of segments so the picker demonstrates cold_start (AI builder
  // with little history) alongside light/heavy users.
  return db
    .prepare<[number]>(`SELECT * FROM users WHERE status = 'active' ORDER BY RANDOM() LIMIT ?`)
    .all(limit) as User[];
}

export function getUser(userId: string): User | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM users WHERE user_id = ?`).get(userId) as User | undefined;
}

export function getUserPreferences(userId: string): UserPreferences | undefined {
  const db = getCatalogDb();
  return db
    .prepare<[string]>(`SELECT * FROM user_preferences WHERE user_id = ?`)
    .get(userId) as UserPreferences | undefined;
}

// ---- Reference ---------------------------------------------------------------

export function getCity(cityId: string): City | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM cities WHERE city_id = ?`).get(cityId) as City | undefined;
}

export function getCurrency(iso4217: string): Currency | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM currencies WHERE iso4217 = ?`).get(iso4217) as Currency | undefined;
}

export function listLanguages(): Language[] {
  const db = getCatalogDb();
  return db.prepare(`SELECT * FROM languages ORDER BY english_name`).all() as Language[];
}

export function getLanguage(bcp47: string): Language | undefined {
  const db = getCatalogDb();
  return db.prepare<[string]>(`SELECT * FROM languages WHERE bcp47 = ?`).get(bcp47) as Language | undefined;
}

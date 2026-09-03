/**
 * Types mirroring the read-only catalog tables in PS-04.db. Field names
 * match the DB columns exactly (R1: additive only, never renamed) — money
 * fields stay as raw TEXT strings here; parse into Decimal at the point of
 * use via src/lib/money.ts, never earlier.
 */

export interface City {
  city_id: string;
  name: string;
  state: string | null;
  country_id: string;
  country_code: string;
  lat: number;
  lng: number;
  timezone: string;
  region: string;
  primary_language: string; // BCP-47
  description: string | null;
  status: string;
}

export interface TourPackage {
  package_id: string;
  city_id: string;
  name: string;
  theme: string;
  tier: string;
  duration_days: number;
  duration_nights: number;
  base_price: string; // decimal string
  currency: string;
  min_group_size: number;
  max_group_size: number;
  difficulty: string;
  languages_offered: string; // comma-separated BCP-47
  inclusions: string;
  exclusions: string;
  description: string;
  status: string;
  updated_at: string;
}

export interface PackageComponent {
  component_id: string;
  package_id: string;
  component_type: string; // hotel|flight|poi|transfer|guide|meal|insurance|entry_ticket
  entity_type: string | null;
  entity_id: string | null;
  day_index: number;
  slot: string;
  title: string;
  quantity: number;
  price_delta: string; // signed decimal string
  currency: string;
  is_optional: number; // sqlite boolean (0/1)
  is_swappable: number;
  swap_group: string | null;
  updated_at: string;
}

export interface Hotel {
  hotel_id: string;
  city_id: string;
  name: string;
  property_type: string;
  star_rating: number;
  guest_score: number | null;
  review_count: number;
  address_line: string;
  lat: number;
  lng: number;
  distance_to_centre_km: number;
  description: string;
  base_currency: string;
  checkin_time: string;
  checkout_time: string;
  has_xr_scene: number;
  status: string;
}

export interface HotelRoomType {
  room_type_id: string;
  hotel_id: string;
  name: string;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  bed_config: string;
  size_sqm: number | null;
  base_rate: string; // decimal string
  currency: string;
  total_units: number;
  status: string;
}

export interface TourGuide {
  guide_id: string;
  city_id: string;
  display_name: string;
  languages: string; // comma-separated BCP-47
  specialisation: string;
  secondary_specialisation: string | null;
  years_experience: number;
  rating: number | null;
  review_count: number;
  day_rate: string;
  half_day_rate: string;
  currency: string;
  certified: number;
  bio: string;
  status: string;
}

export interface GuideAvailability {
  availability_id: string;
  guide_id: string;
  for_date: string; // zoneless calendar date
  is_available: number;
  slots_available: number;
  price_multiplier: number; // NUMERIC(4,2) — better-sqlite3 returns this as a JS number, not a string
}

export interface Transfer {
  transfer_id: string;
  city_id: string;
  from_label: string;
  to_label: string;
  mode: string;
  duration_minutes: number;
  distance_km: number;
  cost: string;
  currency: string;
  carbon_kg: number;
  capacity_pax: number;
  accessible: number;
  status: string;
}

export interface User {
  user_id: string;
  display_name: string;
  email: string;
  home_city_id: string;
  home_currency: string;
  locale: string; // BCP-47
  budget_band: string;
  travel_style: string;
  traveller_type: string;
  segment: string; // heavy | light | cold_start
  status: string;
}

export interface UserPreferences {
  preference_id: string;
  user_id: string;
  preferred_languages: string; // comma-separated BCP-47
  guide_language: string | null;
  interests: string; // comma-separated category codes
  dietary_flags: string | null;
  accessibility_needs: string | null;
  preferred_currency: string;
  max_daily_budget: string | null;
  max_daily_budget_currency: string | null;
  pace: string;
  updated_at: string;
}

export interface Currency {
  currency_id: string;
  iso4217: string;
  name: string;
  symbol: string;
  minor_unit_exponent: number;
  display_locale: string;
}

export interface Language {
  language_id: string;
  bcp47: string;
  english_name: string;
  native_name: string;
  script: string;
  rtl: number;
  tts_supported: number;
}

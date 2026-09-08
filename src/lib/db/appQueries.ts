/**
 * Read helpers for PackagePro's own additive database (app.db). Kept
 * separate from ./queries.ts (which reads the read-only catalog) so the
 * read/write split stays obvious: catalog reads → queries.ts, app reads →
 * here, app writes → the route handlers (they write through getAppDb()
 * directly, keeping migrations in one place).
 */
import { getAppDb } from "./app";
import { getPackage } from "./queries";

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  booking_id: string;
  customization_id: string;
  user_id: string;
  booking_reference: string;
  total_amount: string;
  currency: string;
  idempotency_key: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  packageName: string;
  packageId: string;
  selections: Record<string, unknown>;
  customizationStatus: string;
}

export function getBookingByReference(reference: string): Booking | undefined {
  const db = getAppDb();
  return db.prepare<[string]>(`SELECT * FROM app_bookings WHERE booking_reference = ?`).get(reference) as
    | Booking
    | undefined;
}

export function getBookingById(bookingId: string): Booking | undefined {
  const db = getAppDb();
  return db.prepare<[string]>(`SELECT * FROM app_bookings WHERE booking_id = ?`).get(bookingId) as
    | Booking
    | undefined;
}

export function getBookingsForUser(userId: string, limit = 50): Booking[] {
  const db = getAppDb();
  return db
    .prepare<[string, number]>(`SELECT * FROM app_bookings WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`)
    .all(userId, limit) as Booking[];
}

/** Enrich a booking with the referenced package + customization for display. */
export function getBookingWithDetails(booking: Booking): BookingWithDetails | undefined {
  // The booking links to a customization, not a package — resolve via the customization.
  const db = getAppDb();
  const customization = db
    .prepare<[string]>(`SELECT package_id, selections_json, status FROM app_package_customizations WHERE customization_id = ?`)
    .get(booking.customization_id) as { package_id: string; selections_json: string; status: string } | undefined;
  if (!customization) return undefined;

  const pkgRow = getPackage(customization.package_id);
  if (!pkgRow) return undefined;

  return {
    ...booking,
    packageName: pkgRow.name,
    packageId: pkgRow.package_id,
    selections: JSON.parse(customization.selections_json),
    customizationStatus: customization.status,
  };
}
import { NextRequest, NextResponse } from "next/server";
import { getAppDb } from "@/lib/db/app";
import { newId } from "@/lib/ids";
import { getPackage } from "@/lib/db/queries";
import { repricePackage } from "@/lib/pricing";
import { getCurrentUserId } from "@/lib/session";
import { randomUUID } from "node:crypto";

interface BookBody {
  customizationId: string;
  idempotencyKey?: string;
}

interface CustomizationRow {
  customization_id: string;
  package_id: string;
  selections_json: string;
}

export async function POST(req: NextRequest) {
  const userId = getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "You need to be logged in to book" }, { status: 401 });

  const body = (await req.json()) as BookBody;
  if (!body.customizationId) return NextResponse.json({ error: "customizationId is required" }, { status: 400 });

  const db = getAppDb();
  const idempotencyKey = body.idempotencyKey ?? randomUUID();

  // Idempotency: if a booking already exists for this key, return it as-is
  // rather than creating a duplicate.
  const existing = db.prepare<[string]>(`SELECT * FROM app_bookings WHERE idempotency_key = ?`).get(
    idempotencyKey
  );
  if (existing) {
    return NextResponse.json({ booking: existing, idempotent: true });
  }

  const customization = db
    .prepare<[string]>(`SELECT * FROM app_package_customizations WHERE customization_id = ?`)
    .get(body.customizationId) as CustomizationRow | undefined;
  if (!customization) return NextResponse.json({ error: "Customization not found" }, { status: 404 });

  const pkg = getPackage(customization.package_id);
  if (!pkg) return NextResponse.json({ error: "Package no longer exists" }, { status: 404 });

  const selections = JSON.parse(customization.selections_json);
  const priced = repricePackage(customization.package_id, selections);

  const bookingId = newId("bkg");
  const bookingReference = `PP-${bookingId.split("_")[1]!.toUpperCase()}`;
  const now = new Date().toISOString();

  try {
    db.prepare(
      `INSERT INTO app_bookings
         (booking_id, customization_id, user_id, booking_reference, total_amount, currency,
          idempotency_key, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`
    ).run(
      bookingId,
      customization.customization_id,
      userId,
      bookingReference,
      priced.total.amount,
      priced.total.currency,
      idempotencyKey,
      now,
      now
    );
  } catch (err) {
    // UNIQUE constraint race on idempotency_key — fetch and return the winner.
    const winner = db.prepare<[string]>(`SELECT * FROM app_bookings WHERE idempotency_key = ?`).get(
      idempotencyKey
    );
    if (winner) return NextResponse.json({ booking: winner, idempotent: true });
    throw err;
  }

  db.prepare(`UPDATE app_package_customizations SET status = 'booked', updated_at = ? WHERE customization_id = ?`).run(
    now,
    customization.customization_id
  );

  const booking = db.prepare<[string]>(`SELECT * FROM app_bookings WHERE booking_id = ?`).get(bookingId);
  return NextResponse.json({ booking, pricing: priced });
}

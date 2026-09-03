import { NextRequest, NextResponse } from "next/server";
import { getAppDb } from "@/lib/db/app";
import { newId } from "@/lib/ids";
import { repricePackage, CustomizationSelections } from "@/lib/pricing";
import { getPackage } from "@/lib/db/queries";
import { getCurrentUserId } from "@/lib/session";

interface SaveBody {
  packageId: string;
  selections: CustomizationSelections;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SaveBody;
  if (!body.packageId) return NextResponse.json({ error: "packageId is required" }, { status: 400 });

  const pkg = getPackage(body.packageId);
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  // Never trust a client-computed total — recompute server-side from the
  // selections before persisting.
  const priced = repricePackage(body.packageId, body.selections ?? {});

  const db = getAppDb();
  const id = newId("cus");
  const now = new Date().toISOString();
  const userId = getCurrentUserId();

  db.prepare(
    `INSERT INTO app_package_customizations
       (customization_id, package_id, user_id, trip_start_date, selections_json,
        computed_total_amount, computed_total_currency, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'saved', ?, ?)`
  ).run(
    id,
    body.packageId,
    userId,
    body.selections?.tripStartDate ?? null,
    JSON.stringify(body.selections ?? {}),
    priced.total.amount,
    priced.total.currency,
    now,
    now
  );

  return NextResponse.json({ customizationId: id, pricing: priced });
}

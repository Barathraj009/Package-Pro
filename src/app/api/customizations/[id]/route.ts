import { NextRequest, NextResponse } from "next/server";
import { getAppDb } from "@/lib/db/app";
import { getPackage } from "@/lib/db/queries";
import { repricePackage } from "@/lib/pricing";

interface CustomizationRow {
  customization_id: string;
  package_id: string;
  user_id: string | null;
  trip_start_date: string | null;
  selections_json: string;
  computed_total_amount: string;
  computed_total_currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getAppDb();
  const lang = new URL(req.url).searchParams.get("lang") ?? undefined;
  const row = db
    .prepare<[string]>(`SELECT * FROM app_package_customizations WHERE customization_id = ?`)
    .get(params.id) as CustomizationRow | undefined;

  if (!row) return NextResponse.json({ error: "Customization not found" }, { status: 404 });

  const pkg = getPackage(row.package_id);
  const selections = JSON.parse(row.selections_json);
  // Recompute live so the view always reflects current catalog data even
  // if this snapshot is old — the stored total is what was booked/shared,
  // but the page can show both.
  const livePricing = pkg ? repricePackage(row.package_id, selections, lang) : null;

  return NextResponse.json({ customization: row, package: pkg, selections, livePricing });
}

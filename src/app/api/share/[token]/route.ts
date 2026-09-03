import { NextRequest, NextResponse } from "next/server";
import { getAppDb } from "@/lib/db/app";
import { getPackage } from "@/lib/db/queries";
import { repricePackage } from "@/lib/pricing";

interface ShareRow {
  share_token: string;
  customization_id: string;
  status: string;
}

interface CustomizationRow {
  customization_id: string;
  package_id: string;
  trip_start_date: string | null;
  selections_json: string;
  computed_total_amount: string;
  computed_total_currency: string;
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const db = getAppDb();
  const lang = new URL(req.url).searchParams.get("lang") ?? undefined;
  const share = db.prepare<[string]>(`SELECT * FROM app_share_links WHERE share_token = ?`).get(params.token) as
    | ShareRow
    | undefined;

  if (!share || share.status !== "active") {
    return NextResponse.json({ error: "This share link is invalid or has been revoked" }, { status: 404 });
  }

  const customization = db
    .prepare<[string]>(`SELECT * FROM app_package_customizations WHERE customization_id = ?`)
    .get(share.customization_id) as CustomizationRow | undefined;

  if (!customization) return NextResponse.json({ error: "Customization not found" }, { status: 404 });

  const pkg = getPackage(customization.package_id);
  const selections = JSON.parse(customization.selections_json);
  const pricing = pkg ? repricePackage(customization.package_id, selections, lang) : null;

  return NextResponse.json({ package: pkg, selections, pricing, readOnly: true });
}

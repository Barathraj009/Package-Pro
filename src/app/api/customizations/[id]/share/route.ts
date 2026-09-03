import { NextRequest, NextResponse } from "next/server";
import { getAppDb } from "@/lib/db/app";
import { newId } from "@/lib/ids";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getAppDb();
  const exists = db
    .prepare<[string]>(`SELECT 1 FROM app_package_customizations WHERE customization_id = ?`)
    .get(params.id);
  if (!exists) return NextResponse.json({ error: "Customization not found" }, { status: 404 });

  const token = newId("shr");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO app_share_links (share_token, customization_id, created_at, status) VALUES (?, ?, ?, 'active')`
  ).run(token, params.id, now);

  // NEXT_PUBLIC_BASE_URL wins when set (the explicit, correct thing to do in
  // production), but if a deploy forgets to set it we fall back to the
  // request's own host/protocol instead of silently emitting a localhost
  // link that would be broken for every visitor.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host") ?? "localhost:3000"}`;
  return NextResponse.json({ shareToken: token, shareUrl: `${base}/share/${token}` });
}

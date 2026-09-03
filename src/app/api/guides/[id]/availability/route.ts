import { NextRequest, NextResponse } from "next/server";
import { getGuideAvailabilityRange, getGuide } from "@/lib/db/queries";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guide = getGuide(params.id);
  if (!guide) return NextResponse.json({ error: "Guide not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "Query params 'from' and 'to' (YYYY-MM-DD) are required" }, { status: 400 });
  }

  const availability = getGuideAvailabilityRange(params.id, from, to);
  return NextResponse.json({ guide, availability });
}

import { NextRequest, NextResponse } from "next/server";
import { searchGuides } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guides = searchGuides({
    cityId: searchParams.get("cityId") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    specialisation: searchParams.get("specialisation") ?? undefined,
    forDate: searchParams.get("forDate") ?? undefined,
  });
  return NextResponse.json({ guides });
}

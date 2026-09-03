import { NextRequest, NextResponse } from "next/server";
import { repricePackage, CustomizationSelections } from "@/lib/pricing";
import { getPackage } from "@/lib/db/queries";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const pkg = getPackage(params.id);
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  let selections: CustomizationSelections = {};
  let uiLang = "en";
  try {
    const body = (await req.json()) as CustomizationSelections & { uiLang?: string };
    const { uiLang: ui, ...rest } = body;
    selections = rest;
    if (typeof ui === "string") uiLang = ui;
  } catch {
    // empty body is fine — reprice with defaults
  }

  try {
    const result = repricePackage(params.id, selections, uiLang);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Reprice failed" }, { status: 400 });
  }
}

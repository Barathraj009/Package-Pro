import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { startSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { userId?: string };
  if (!body.userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const user = getUser(body.userId);
  if (!user) return NextResponse.json({ error: "Unknown user" }, { status: 404 });

  startSession(user.user_id);
  return NextResponse.json({ user });
}

import { NextResponse } from "next/server";
import { listDemoUsers } from "@/lib/db/queries";

export async function GET() {
  const users = listDemoUsers(24);
  return NextResponse.json({ users });
}

import { NextResponse } from "next/server";
import { getCatalogDb } from "@/lib/db/catalog";
import { getAppDb } from "@/lib/db/app";

// Without this, Next.js statically optimizes this route at build time (it has
// no cookies()/request-based signal telling it otherwise) and would freeze
// the very first response forever — defeating the point of a health check.
export const dynamic = "force-dynamic";

/**
 * Cheap liveness/readiness check for hosting platforms (Render health checks,
 * uptime monitors, a manual "is it awake yet" ping after a free-tier cold
 * start). Confirms both databases actually open, not just that the process
 * is running.
 */
export async function GET() {
  try {
    const catalogCount = getCatalogDb().prepare(`SELECT COUNT(*) AS n FROM tour_packages`).get() as {
      n: number;
    };
    getAppDb().prepare(`SELECT 1`).get();

    return NextResponse.json({
      status: "ok",
      catalogPackages: catalogCount.n,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "unknown error" },
      { status: 503 }
    );
  }
}

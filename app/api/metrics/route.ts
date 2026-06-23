import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Read-only dashboard data for the signed-in user (or demo data). Also what the
// service worker caches for offline viewing.
export async function GET() {
  const data = await getDashboard();
  return NextResponse.json(data);
}

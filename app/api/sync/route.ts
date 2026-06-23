import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { syncState } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { backfillUser, reconcileUser } from "@/lib/health-api/sync";

export const runtime = "nodejs";

// Manual "Sync now". First run does a full backfill; later runs reconcile recent days.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const prior = db
    ? (await db.select().from(syncState).where(eq(syncState.userId, user.id)).limit(1))[0]
    : null;

  const days = prior?.lastBackfillAt
    ? await reconcileUser(user.id)
    : await backfillUser(user.id);

  return NextResponse.json({ ok: true, days });
}

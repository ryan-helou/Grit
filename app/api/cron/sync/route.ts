import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { env } from "@/lib/config";
import { reconcileUser } from "@/lib/health-api/sync";

export const runtime = "nodejs";

// Safety-net reconcile in case a webhook is missed. Vercel Cron calls this with
// `Authorization: Bearer <CRON_SECRET>`.
export async function GET(req: NextRequest) {
  if (env.cronSecret && req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!db) return NextResponse.json({ ok: true, synced: 0 });

  const all = await db.select({ id: users.id }).from(users);
  let synced = 0;
  for (const u of all) {
    try {
      await reconcileUser(u.id);
      synced++;
    } catch (err) {
      console.error(`[cron] reconcile ${u.id} failed:`, err);
    }
  }
  return NextResponse.json({ ok: true, synced });
}

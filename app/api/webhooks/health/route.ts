import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { reconcileUser } from "@/lib/health-api/sync";

export const runtime = "nodejs";

// Google may verify the endpoint with a GET challenge before delivering events.
// TODO(verify): confirm the exact verification handshake in the Webhooks ref.
export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get("challenge");
  return challenge
    ? new NextResponse(challenge)
    : NextResponse.json({ ok: true });
}

// Push notification that new data landed → reconcile.
export async function POST(req: NextRequest) {
  // TODO(verify): validate Google's signature header and map the payload to the
  // affected user. As a single-user personal app, reconciling everyone is fine.
  await req.json().catch(() => ({}));

  if (db) {
    const all = await db.select({ id: users.id }).from(users);
    for (const u of all) {
      try {
        await reconcileUser(u.id);
      } catch (err) {
        console.error(`[webhook] reconcile ${u.id} failed:`, err);
      }
    }
  }
  return NextResponse.json({ ok: true });
}

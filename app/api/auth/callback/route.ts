import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { exchangeCode, fetchUserInfo } from "@/lib/google-oauth";
import { isAllowed, SESSION_COOKIE } from "@/lib/config";
import { db } from "@/db";
import { users, oauthAccounts } from "@/db/schema";
import { encrypt } from "@/lib/crypto";
import { signSession, sessionCookieOpts, SESSION_MAX_AGE } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("grit_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }

  const tokens = await exchangeCode(code);
  const info = await fetchUserInfo(tokens.access_token);

  if (!info.email || !isAllowed(info.email)) {
    return NextResponse.redirect(new URL("/login?error=not_allowed", req.url));
  }
  if (!db) {
    return NextResponse.redirect(new URL("/login?error=no_db", req.url));
  }

  const email = info.email.toLowerCase();
  const existing = (
    await db.select().from(users).where(eq(users.email, email)).limit(1)
  )[0];

  let userId: string;
  if (existing) {
    userId = existing.id;
    await db
      .update(users)
      .set({ name: info.name, image: info.picture })
      .where(eq(users.id, userId));
  } else {
    const inserted = await db
      .insert(users)
      .values({ email, name: info.name, image: info.picture })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db
    .insert(oauthAccounts)
    .values({
      userId,
      provider: "google",
      accessTokenEnc: encrypt(tokens.access_token),
      refreshTokenEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expiresAt,
      scope: tokens.scope,
    })
    .onConflictDoUpdate({
      target: [oauthAccounts.userId, oauthAccounts.provider],
      set: {
        accessTokenEnc: encrypt(tokens.access_token),
        // keep existing refresh token if Google didn't return a new one
        refreshTokenEnc: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : undefined,
        expiresAt,
        scope: tokens.scope,
        updatedAt: new Date(),
      },
    });

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(SESSION_COOKIE, signSession(userId), {
    ...sessionCookieOpts,
    maxAge: SESSION_MAX_AGE,
  });
  res.cookies.delete("grit_oauth_state");
  return res;
}

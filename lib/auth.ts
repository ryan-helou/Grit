import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, oauthAccounts, type User } from "@/db/schema";
import { getSessionUserId } from "./session";
import { decrypt, encrypt } from "./crypto";
import { refreshAccessToken } from "./google-oauth";

export async function getSessionUser(): Promise<User | null> {
  if (!db) return null;
  const uid = await getSessionUserId();
  if (!uid) return null;
  const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return rows[0] ?? null;
}

/** Returns a fresh access token, refreshing (and persisting) if near expiry. */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  if (!db) return null;
  const where = and(
    eq(oauthAccounts.userId, userId),
    eq(oauthAccounts.provider, "google"),
  );
  const acct = (await db.select().from(oauthAccounts).where(where).limit(1))[0];
  if (!acct) return null;

  const valid = acct.expiresAt && acct.expiresAt.getTime() - Date.now() > 60_000;
  if (valid) return decrypt(acct.accessTokenEnc);
  if (!acct.refreshTokenEnc) return null;

  const refreshed = await refreshAccessToken(decrypt(acct.refreshTokenEnc));
  await db
    .update(oauthAccounts)
    .set({
      accessTokenEnc: encrypt(refreshed.access_token),
      refreshTokenEnc: refreshed.refresh_token
        ? encrypt(refreshed.refresh_token)
        : acct.refreshTokenEnc,
      expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(where);
  return refreshed.access_token;
}

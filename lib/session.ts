import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env, SESSION_COOKIE } from "./config";

// Stateless HMAC-signed session cookie carrying the user id. Verified in Node
// runtime (route handlers / server components); middleware only checks presence.

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const secureCookies = process.env.NODE_ENV === "production";

const b64 = (s: Buffer | string) => Buffer.from(s).toString("base64url");

export function signSession(uid: string): string {
  const payload = b64(JSON.stringify({ uid, iat: Math.floor(Date.now() / 1000) }));
  const sig = createHmac("sha256", env.sessionSecret!).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token || !env.sessionSecret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", env.sessionSecret)
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid, iat } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof iat === "number" && Date.now() / 1000 - iat > MAX_AGE) return null;
    return typeof uid === "string" ? uid : null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOpts = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: "lax" as const,
  path: "/",
};

export const SESSION_MAX_AGE = MAX_AGE;

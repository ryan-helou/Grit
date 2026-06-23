import { env } from "./config";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

// OpenID scopes used for sign-in / identity.
const IDENTITY_SCOPES = ["openid", "email", "profile"];

// TODO(verify): the exact Google Health API scope strings are in the Health API
// "Scopes" reference (developers.google.com/health). Add the real scopes for
// each data type you read (heart rate, sleep, steps, SpO2, HRV, …) here before
// going live. Example shape — NOT confirmed:
//   "https://www.googleapis.com/auth/health.heart_rate.read"
export const HEALTH_SCOPES: string[] = [
  // add verified Google Health API scopes here
];

export const SCOPES = [...IDENTITY_SCOPES, ...HEALTH_SCOPES];

export function getAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: env.googleClientId!,
    redirect_uri: env.googleRedirectUri!,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // request a refresh token
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${p.toString()}`;
}

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export function exchangeCode(code: string): Promise<TokenResponse> {
  return tokenRequest({
    code,
    client_id: env.googleClientId!,
    client_secret: env.googleClientSecret!,
    redirect_uri: env.googleRedirectUri!,
    grant_type: "authorization_code",
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest({
    client_id: env.googleClientId!,
    client_secret: env.googleClientSecret!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

export async function fetchUserInfo(
  accessToken: string,
): Promise<{ email: string; name?: string; picture?: string }> {
  const res = await fetch(USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);
  return res.json();
}

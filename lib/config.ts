// Feature detection from env. When auth/DB aren't configured the app runs in
// demo mode (seeded mock data, no login required) so it's always runnable.

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  sessionSecret: process.env.SESSION_SECRET,
  tokenKey: process.env.TOKEN_ENCRYPTION_KEY,
  cronSecret: process.env.CRON_SECRET,
};

export const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const dbConfigured = !!env.databaseUrl;
export const authConfigured = !!(
  env.googleClientId &&
  env.googleClientSecret &&
  env.googleRedirectUri &&
  env.sessionSecret
);

/** When true, gate routes behind login and read real data. */
export const secured = authConfigured && dbConfigured;

export function isAllowed(email: string): boolean {
  if (allowedEmails.length === 0) return false;
  return allowedEmails.includes(email.toLowerCase());
}

export const SESSION_COOKIE = "grit_session";

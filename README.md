# Grit

A personal, **Whoop-style** dashboard for your **Fitbit Air** — recovery, sleep, and
strain in more depth than the consumer Google Health app. Built on the new
**Google Health API**, installable as a **PWA**.

> The legacy Fitbit Web API is decommissioned in **Sept 2026**; Grit targets its
> replacement, the **Google Health API** (`health.googleapis.com/v4`).

---

## Run it now (demo mode)

With no environment configured, Grit runs on seeded mock data — no login, no DB:

```bash
npm install
npm run dev
# open http://localhost:3000
```

Everything renders (readiness ring, vitals, trends, sleep stages, activity) so you
can shape the design before wiring real data. Pages show a **"Demo data"** badge.

---

## How it works

- **Next.js (App Router) + TypeScript**, one app: dashboard UI, OAuth, ingestion, sync.
- **Neon Postgres + Drizzle ORM** for storage; **Vercel** for hosting + Cron.
- **Sign in with Google** = login *and* health-scope consent, gated by an email
  **allowlist** → the OAuth app stays in **"testing" mode** and skips Google's paid
  restricted-scope security assessment.
- Data flow: OAuth → store encrypted tokens → **backfill** history → **webhook + cron**
  keep it fresh → dashboard reads from the DB (`lib/data.ts`). No live data? It falls
  back to demo automatically.

---

## Phase 0 — going from demo to real data

### 1. Neon database
1. Create a free project at <https://neon.tech>.
2. Copy the connection string → `DATABASE_URL`.

### 2. Google Cloud / OAuth
1. <https://console.cloud.google.com> → create a project.
2. **Enable the Google Health API** (APIs & Services → Library).
3. **OAuth consent screen** → User type **External**, publishing status **Testing**.
   Add your Google account under **Test users**.
4. **Credentials → Create OAuth client ID → Web application**. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://YOUR-APP.vercel.app/api/auth/callback`
5. Copy the client ID/secret → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### 3. Environment
```bash
cp .env.example .env.local
# fill DATABASE_URL, GOOGLE_CLIENT_ID/SECRET, ALLOWED_EMAILS
# generate secrets:
openssl rand -hex 32   # → SESSION_SECRET
openssl rand -hex 32   # → TOKEN_ENCRYPTION_KEY
openssl rand -hex 32   # → CRON_SECRET
```

### 4. Database schema
```bash
npm run db:push      # create tables in Neon (or db:generate + db:migrate)
```

### 5. ⚠️ Verify the Google Health API specifics
The v4 API is new; a few details are **best-guess placeholders marked `TODO(verify)`**.
Confirm against the API reference (developers.google.com/health) and correct:
- **OAuth scopes** — `HEALTH_SCOPES` in [`lib/google-oauth.ts`](lib/google-oauth.ts)
- **Data-type IDs + endpoint paths** — `DATA_TYPES`, `listDaily`, `listIntraday` in
  [`lib/health-api/client.ts`](lib/health-api/client.ts)
- **Response shape** — `toPoints` in [`lib/health-api/normalize.ts`](lib/health-api/normalize.ts)
- **Webhook handshake** — [`app/api/webhooks/health/route.ts`](app/api/webhooks/health/route.ts)

Then `npm run dev`, sign in, and trigger a first backfill (call `backfillUser` from a
script or hit the cron endpoint with the `CRON_SECRET`).

---

## Deploy (Vercel)
1. Import the repo, add all env vars (use the prod `GOOGLE_REDIRECT_URI`).
2. `vercel.json` already schedules the reconcile cron (every 3h → `/api/cron/sync`).
3. Register a Google Health API **webhook** pointing at
   `https://YOUR-APP.vercel.app/api/webhooks/health`.

---

## Sharing later (it's already multi-user-ready)
Tokens and data are keyed per user. To add a friend: add their email to `ALLOWED_EMAILS`
and as a Google **test user**. Note: in *testing* mode Google expires refresh tokens
every **7 days**, so each person re-logs in ~weekly. Going public (no weekly re-login)
requires Google OAuth verification + a paid security assessment.

---

## Structure
```
app/            routes: dashboard (page/trends/sleep/activity), login, api/*
components/     readiness ring, sparkline, cards, tab nav, chrome
lib/            data seam, metrics config, mock data, auth, oauth, crypto, health-api/
db/             Drizzle schema + Neon client
```

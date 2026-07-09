# Grit

*A Whoop-style recovery dashboard for the Fitbit Air, built on Google's new Health API.*

The consumer Google Health app shows you a number and hides the math. Grit does the
opposite: it pulls your daily metrics out of the Google Health API (`health.googleapis.com/v4`),
stores them, and recomputes a readiness score you can actually take apart. The old Fitbit
Web API is being decommissioned in September 2026, so this targets its replacement.

You sign in with Google. That single OAuth grant is both the login and the health-data
consent, and it's gated by an email allowlist so the app can stay in Google's "testing"
publishing mode. On first connect it backfills 90 days of history; after that a Vercel
Cron job hits `/api/cron/sync` every three hours (`0 */3 * * *`) to reconcile the last
seven days, with a webhook at `/api/webhooks/health` for pushes in between. Access and
refresh tokens are encrypted at rest. With no database or OAuth configured, Grit runs
entirely on seeded mock data and every page still renders behind a "Demo data" badge.

## What it tracks

Ten daily series feed the dashboard: HRV, resting heart rate, sleep score, time asleep,
SpO₂, skin-temperature variation, respiratory rate, steps, and cardio load — plus a
readiness score Grit derives itself rather than echoing the device's. Readiness starts
from a baseline of 60 and moves with how far HRV (+/-26), resting HR (+/-20), and sleep
(-18/+22) sit from their own means, clamped to 6–99. A score of 67+ reads as **Primed**,
34+ as **Steady**, below that **Strained** — and the same band colors every metric card.

Because it owns the raw series, Grit also surfaces things the consumer app won't: the
Pearson correlation between last night's sleep and next-day readiness, HRV expressed as a
z-score against your 30-day baseline, and a two-week resting-HR slope in bpm/week. The
activity page charts your last seven days of steps against a weekly total and plots cardio
load as training load. `/api/export` hands the whole thing back as CSV — one row per day,
every metric a column.

## Stack

Next.js (App Router) and TypeScript, React 19, Neon Postgres with Drizzle ORM, Tailwind,
hosted on Vercel and installable as a PWA. It's a personal single-user build, and a few
Health API specifics (exact scope strings, data-type IDs, the webhook handshake) are still
marked `TODO(verify)` against Google's reference until the v4 API is confirmed end to end.

import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  date,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// One row per (user, provider). Tokens are stored AES-256-GCM encrypted.
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("google"),
    accessTokenEnc: text("access_token_enc").notNull(),
    refreshTokenEnc: text("refresh_token_enc"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    scope: text("scope"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.provider] })],
);

// One row per (user, day). Raw API payload kept so we can reprocess without
// re-fetching from Google.
export const dailySummary = pgTable(
  "daily_summary",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    readiness: integer("readiness"),
    restingHr: integer("resting_hr"),
    hrv: integer("hrv"),
    sleepScore: integer("sleep_score"),
    sleepMinutes: integer("sleep_minutes"),
    spo2: integer("spo2"),
    skinTempVar: real("skin_temp_var"),
    respiratoryRate: real("respiratory_rate"),
    steps: integer("steps"),
    cardioLoad: integer("cardio_load"),
    raw: jsonb("raw"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const sleepSessions = pgTable(
  "sleep_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    startTs: timestamp("start_ts", { withTimezone: true }),
    endTs: timestamp("end_ts", { withTimezone: true }),
    score: integer("score"),
    // [{ key, label, minutes, color }]
    stages: jsonb("stages"),
    raw: jsonb("raw"),
  },
  (t) => [index("sleep_user_day_idx").on(t.userId, t.day)],
);

export const heartRateIntraday = pgTable(
  "heart_rate_intraday",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    bpm: integer("bpm").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.ts] })],
);

export const syncState = pgTable("sync_state", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lastBackfillAt: timestamp("last_backfill_at", { withTimezone: true }),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  cursor: text("cursor"),
});

export type User = typeof users.$inferSelect;
export type DailyRow = typeof dailySummary.$inferSelect;

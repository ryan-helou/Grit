import { db } from "@/db";
import { dailySummary, syncState } from "@/db/schema";
import { DATA_TYPES, listDaily } from "./client";
import { toPoints } from "./normalize";

// Each daily data type maps to one daily_summary column.
const DAILY_METRICS: { dataType: string; column: string }[] = [
  { dataType: DATA_TYPES.readiness, column: "readiness" },
  { dataType: DATA_TYPES.hrv, column: "hrv" },
  { dataType: DATA_TYPES.restingHr, column: "restingHr" },
  { dataType: DATA_TYPES.sleepScore, column: "sleepScore" },
  { dataType: DATA_TYPES.sleepMinutes, column: "sleepMinutes" },
  { dataType: DATA_TYPES.spo2, column: "spo2" },
  { dataType: DATA_TYPES.skinTempVar, column: "skinTempVar" },
  { dataType: DATA_TYPES.respiratoryRate, column: "respiratoryRate" },
  { dataType: DATA_TYPES.steps, column: "steps" },
  { dataType: DATA_TYPES.cardioLoad, column: "cardioLoad" },
];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Pull daily aggregates for every metric over the window and upsert one row per
 * day. Used for both first-connect backfill (large window) and the periodic
 * reconcile (small window).
 */
export async function syncUser(userId: string, days = 90): Promise<number> {
  if (!db) return 0;
  const startISO = isoDaysAgo(days);
  const endISO = isoDaysAgo(0);

  // Merge values from all data types into one partial row per day.
  const byDay = new Map<string, Record<string, number>>();
  for (const { dataType, column } of DAILY_METRICS) {
    try {
      const json = await listDaily(userId, dataType, startISO, endISO);
      for (const p of toPoints(json)) {
        const row = byDay.get(p.date) ?? {};
        row[column] = p.value;
        byDay.set(p.date, row);
      }
    } catch (err) {
      // One metric failing (e.g. device doesn't produce it) shouldn't abort the rest.
      console.error(`[sync] ${column} failed:`, err);
    }
  }

  for (const [day, cols] of byDay) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = { userId, day, ...cols } as any;
    await db
      .insert(dailySummary)
      .values(values)
      .onConflictDoUpdate({
        target: [dailySummary.userId, dailySummary.day],
        set: cols,
      });
  }

  const now = new Date();
  await db
    .insert(syncState)
    .values({ userId, lastBackfillAt: now, lastSyncAt: now })
    .onConflictDoUpdate({ target: syncState.userId, set: { lastSyncAt: now } });

  return byDay.size;
}

export const backfillUser = (userId: string) => syncUser(userId, 90);
export const reconcileUser = (userId: string) => syncUser(userId, 7);

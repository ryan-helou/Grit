import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailySummary, sleepSessions } from "@/db/schema";
import { getSessionUser } from "./auth";
import { secured } from "./config";
import { demoDataset, mockStages } from "./mock-data";
import { computeReadinessSeries } from "./readiness-compute";
import type { Dataset, MetricKey, Series, StageSlice } from "./types";

const emptySeries = (): Series => ({
  readiness: [],
  hrv: [],
  restingHr: [],
  sleepScore: [],
  sleepHours: [],
  spo2: [],
  skinTempVar: [],
  respiratoryRate: [],
  steps: [],
  cardioLoad: [],
});

/**
 * The single seam the dashboard reads from. Demo mode (no auth/DB, or no data
 * yet) returns seeded mock data; a secured, synced user returns their real rows.
 */
export async function getDashboard(): Promise<Dataset> {
  const ds = await resolveDataset();
  // Always derive readiness from its inputs so the ring, breakdown, and
  // insights stay consistent (and it works whether or not the API provides one).
  return {
    ...ds,
    series: { ...ds.series, readiness: computeReadinessSeries(ds.series) },
  };
}

async function resolveDataset(): Promise<Dataset> {
  if (!secured || !db) return demoDataset();
  const user = await getSessionUser();
  if (!user) return demoDataset();
  return (await loadUserSeries(user.id)) ?? demoDataset();
}

async function loadUserSeries(userId: string): Promise<Dataset | null> {
  if (!db) return null;
  const rows = await db
    .select()
    .from(dailySummary)
    .where(eq(dailySummary.userId, userId))
    .orderBy(dailySummary.day);
  if (rows.length === 0) return null;

  const series = emptySeries();
  const push = (key: MetricKey, day: string, v: number | null, scale = 1) => {
    if (v == null) return;
    series[key].push({ date: day, value: scale === 1 ? v : +(v * scale).toFixed(1) });
  };

  for (const r of rows.slice(-30)) {
    const day = String(r.day);
    push("readiness", day, r.readiness);
    push("hrv", day, r.hrv);
    push("restingHr", day, r.restingHr);
    push("sleepScore", day, r.sleepScore);
    push("sleepHours", day, r.sleepMinutes, 1 / 60);
    push("spo2", day, r.spo2);
    push("skinTempVar", day, r.skinTempVar);
    push("respiratoryRate", day, r.respiratoryRate);
    push("steps", day, r.steps);
    push("cardioLoad", day, r.cardioLoad);
  }

  // Until every rendered metric has data, fall back to demo to avoid empty
  // charts / crashes on partial ingestion.
  const missing = (Object.keys(series) as MetricKey[]).filter(
    (k) => series[k].length === 0,
  );
  if (missing.length) {
    console.warn(`[data] incomplete series, missing: ${missing.join(", ")}`);
    return null;
  }

  // TODO: populate hypnogram from sleep_sessions segments and intradayHr from
  // the heart_rate_intraday table once ingestion writes them. Empty → those
  // sections simply hide (no faked data on a real account).
  return {
    series,
    stages: await loadStages(userId),
    hypnogram: [],
    intradayHr: [],
    demo: false,
  };
}

async function loadStages(userId: string): Promise<StageSlice[]> {
  if (!db) return mockStages;
  const row = (
    await db
      .select()
      .from(sleepSessions)
      .where(eq(sleepSessions.userId, userId))
      .orderBy(desc(sleepSessions.day))
      .limit(1)
  )[0];
  const stages = row?.stages as StageSlice[] | undefined;
  return stages && stages.length ? stages : mockStages;
}

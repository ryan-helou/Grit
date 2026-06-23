import type { Point, Series, MetricKey } from "./types";
import { mean, vals, pearson } from "./stats";

// ── Training load: acute:chronic workload ratio (ACWR) ──────────────────────
// Acute = last 7-day mean load, chronic = last 28-day mean. The ratio is a
// well-established overtraining/under-training signal in sports science.
export type LoadStatus = "detraining" | "optimal" | "caution" | "high";

export function trainingLoad(load: Point[]): {
  acute: number;
  chronic: number;
  ratio: number;
  status: LoadStatus;
} {
  const acute = mean(vals(load).slice(-7));
  const chronic = mean(vals(load).slice(-28));
  const ratio = chronic ? acute / chronic : 0;
  const status: LoadStatus =
    ratio < 0.8 ? "detraining" : ratio <= 1.3 ? "optimal" : ratio <= 1.5 ? "caution" : "high";
  return { acute, chronic, ratio, status };
}

export const LOAD_COPY: Record<LoadStatus, { label: string; tone: "good" | "bad" | "neutral" }> = {
  detraining: { label: "Detraining", tone: "neutral" },
  optimal: { label: "Optimal load", tone: "good" },
  caution: { label: "Ramping fast", tone: "neutral" },
  high: { label: "Injury risk", tone: "bad" },
};

// ── What moves readiness: same-day correlation of each input ────────────────
const DRIVER_KEYS: MetricKey[] = [
  "hrv",
  "restingHr",
  "sleepScore",
  "sleepHours",
  "spo2",
  "cardioLoad",
  "steps",
  "respiratoryRate",
];

export function readinessCorrelations(series: Series): { key: MetricKey; r: number }[] {
  const r = vals(series.readiness);
  return DRIVER_KEYS.map((k) => ({ key: k, r: pearson(vals(series[k]), r) })).sort(
    (a, b) => Math.abs(b.r) - Math.abs(a.r),
  );
}

// ── Scatter pair + least-squares fit ────────────────────────────────────────
export function scatterPair(
  x: Point[],
  y: Point[],
): { pts: { x: number; y: number }[]; r: number; m: number; b: number } {
  const n = Math.min(x.length, y.length);
  const xs = x.slice(0, n).map((p) => p.value);
  const ys = y.slice(0, n).map((p) => p.value);
  const r = pearson(xs, ys);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const m = den ? num / den : 0;
  return { pts: xs.map((xv, i) => ({ x: xv, y: ys[i] })), r, m, b: my - m * mx };
}

// ── Week in review: last 7 days vs the 7 before ─────────────────────────────
const WEEK_METRICS: {
  key: MetricKey;
  label: string;
  unit?: string;
  decimals?: number;
  betterUp: boolean;
}[] = [
  { key: "readiness", label: "Readiness", betterUp: true },
  { key: "sleepScore", label: "Sleep", betterUp: true },
  { key: "hrv", label: "HRV", unit: " ms", betterUp: true },
  { key: "restingHr", label: "Resting HR", unit: " bpm", betterUp: false },
  { key: "cardioLoad", label: "Cardio load", betterUp: true },
  { key: "steps", label: "Steps", betterUp: true },
];

export function weekReview(series: Series) {
  return WEEK_METRICS.map((m) => ({
    ...m,
    cur: mean(vals(series[m.key]).slice(-7)),
    prev: mean(vals(series[m.key]).slice(-14, -7)),
  }));
}

// ── Average by weekday (0 = Sunday) ─────────────────────────────────────────
export function byWeekday(p: Point[]): number[] {
  const sums = Array(7).fill(0);
  const counts = Array(7).fill(0);
  for (const pt of p) {
    const d = new Date(pt.date + "T00:00:00Z").getUTCDay();
    sums[d] += pt.value;
    counts[d] += 1;
  }
  return sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
}

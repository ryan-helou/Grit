import { latest, prev, avg } from "./mock-data";
import { scoreColorVar } from "./readiness";
import type { MetricKey, Series } from "./types";

// Single source of truth describing each metric: label, unit, which direction
// is "good", and whether it belongs to recovery (traffic-light colored) or
// exertion (blue). Pages read values out of a Series via these helpers, so the
// mock → real-data swap is just which Series gets passed in.

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit?: string;
  better: "up" | "down";
  accent: "recovery" | "exertion";
  decimals?: number;
};

export const METRICS: MetricDef[] = [
  { key: "hrv", label: "HRV", unit: "ms", better: "up", accent: "recovery" },
  { key: "restingHr", label: "Resting HR", unit: "bpm", better: "down", accent: "recovery" },
  { key: "sleepScore", label: "Sleep Score", better: "up", accent: "recovery" },
  { key: "sleepHours", label: "Time Asleep", unit: "h", better: "up", accent: "recovery", decimals: 1 },
  { key: "spo2", label: "SpO₂", unit: "%", better: "up", accent: "recovery" },
  { key: "skinTempVar", label: "Skin Temp", unit: "°C", better: "down", accent: "recovery", decimals: 1 },
  { key: "respiratoryRate", label: "Resp Rate", unit: "br/min", better: "down", accent: "recovery", decimals: 1 },
  { key: "steps", label: "Steps", better: "up", accent: "exertion" },
  { key: "cardioLoad", label: "Cardio Load", better: "up", accent: "exertion" },
];

export type Change = { value: string; dir: "up" | "down" | "flat"; good: boolean };

export function metric(key: MetricKey): MetricDef {
  return METRICS.find((m) => m.key === key)!;
}

export function accentColor(def: MetricDef, readiness: number): string {
  return def.accent === "exertion"
    ? "var(--color-exertion)"
    : scoreColorVar(readiness);
}

export function valueFor(def: MetricDef, series: Series): string {
  const v = latest(series[def.key]);
  return def.decimals ? v.toFixed(def.decimals) : v.toLocaleString("en-US");
}

export function avgFor(def: MetricDef, series: Series, n = 7): string {
  const a = avg(series[def.key], n);
  return def.decimals ? a.toFixed(def.decimals) : Math.round(a).toLocaleString("en-US");
}

export function changeFor(def: MetricDef, series: Series): Change {
  const d = latest(series[def.key]) - prev(series[def.key]);
  const dir = d > 0.05 ? "up" : d < -0.05 ? "down" : "flat";
  const good = dir === "flat" ? true : def.better === "up" ? dir === "up" : dir === "down";
  const mag = def.decimals
    ? Math.abs(d).toFixed(def.decimals)
    : Math.round(Math.abs(d)).toLocaleString("en-US");
  return { value: mag, dir, good };
}

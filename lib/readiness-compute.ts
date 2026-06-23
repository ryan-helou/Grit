import type { Point, Series } from "./types";
import { baseline, mean, vals } from "./stats";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// Grit's transparent readiness: a composite of HRV, resting HR, and sleep vs
// their baselines. Computing it ourselves (rather than echoing a black-box
// number) is what lets the ring, the breakdown, and the insights all agree.
export function computeReadinessSeries(series: Series): Point[] {
  const { hrv, restingHr: rhr, sleepScore: sleep } = series;
  const bH = mean(vals(hrv)) || 1;
  const bR = mean(vals(rhr)) || 1;
  const bS = mean(vals(sleep)) || 1;
  return hrv.map((p, i) => {
    const hPart = clamp(((hrv[i].value - bH) / bH) * 110, -26, 26); // HRV up = good
    const rPart = clamp(((bR - rhr[i].value) / bR) * 200, -20, 20); // RHR down = good
    const sPart = clamp(((sleep[i].value - bS) / bS) * 120, -18, 22); // sleep up = good
    return { date: p.date, value: Math.round(clamp(60 + hPart + rPart + sPart, 6, 99)) };
  });
}

// Explains today's readiness by how its main inputs deviate from baseline —
// the transparency the consumer app never shows.
export type Driver = {
  label: string;
  impact: "up" | "down" | "neutral";
  detail: string;
};

function driver(
  label: string,
  p: Point[],
  betterUp: boolean,
  unit: string,
  decimals = 0,
): Driver {
  const cur = p[p.length - 1].value;
  const base = baseline(p, 30);
  const diff = cur - base;
  const favorable = betterUp ? diff > 0 : diff < 0;
  const significant = Math.abs(diff) > Math.abs(base) * 0.04;
  const fmt = (v: number) => (decimals ? v.toFixed(decimals) : Math.round(v).toString());
  const sign = diff > 0 ? "+" : "";
  return {
    label,
    impact: significant ? (favorable ? "up" : "down") : "neutral",
    detail: `${fmt(cur)}${unit} vs ${fmt(base)}${unit} baseline (${sign}${fmt(diff)})`,
  };
}

export function readinessDrivers(series: Series): Driver[] {
  return [
    driver("HRV", series.hrv, true, " ms"),
    driver("Resting HR", series.restingHr, false, " bpm"),
    driver("Sleep", series.sleepScore, true, ""),
  ];
}

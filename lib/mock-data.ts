// Deterministic mock biometrics so the dashboard is fully demoable before the
// Google Cloud / Neon setup (Phase 0) is wired. No Date.now()/random — values
// derive from a fixed base date so server render is stable.

import type {
  Point,
  Series,
  StageSlice,
  Dataset,
  SleepSegment,
  IntradayPoint,
} from "./types";

const DAYS = 365;
const BASE_ISO = "2026-06-23"; // "today"

function isoDaysAgo(n: number): string {
  const d = new Date(BASE_ISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function series(opts: {
  base: number;
  amp: number;
  period?: number;
  phase?: number;
  drift?: number;
  decimals?: number;
  min?: number;
  max?: number;
}): Point[] {
  const {
    base,
    amp,
    period = 9,
    phase = 0,
    drift = 0,
    decimals = 0,
    min = -Infinity,
    max = Infinity,
  } = opts;
  const pts: Point[] = [];
  for (let i = 0; i < DAYS; i++) {
    const wave =
      amp * Math.sin((i / period) * Math.PI * 2 + phase) + // weekly-ish rhythm
      amp * 0.22 * Math.sin(i * 1.3 + phase * 2) + // day-to-day jitter
      amp * 0.6 * Math.sin((i / DAYS) * Math.PI * 2 + phase); // slow seasonal arc
    let v = base + wave + drift * (i - (DAYS - 1));
    v = Math.min(max, Math.max(min, v));
    pts.push({
      date: isoDaysAgo(DAYS - 1 - i),
      value: decimals ? +v.toFixed(decimals) : Math.round(v),
    });
  }
  return pts;
}

export const mockSeries: Series = {
  readiness: series({ base: 70, amp: 18, period: 8, min: 22, max: 98 }),
  hrv: series({ base: 52, amp: 13, period: 7, phase: 0.6, min: 24 }),
  restingHr: series({ base: 54, amp: 4, period: 11, phase: 2.1, min: 46 }),
  sleepScore: series({ base: 81, amp: 10, period: 6, phase: 1.2, min: 50, max: 99 }),
  sleepHours: series({ base: 7.2, amp: 1.1, period: 5, phase: 0.4, decimals: 1, min: 4.5 }),
  spo2: series({ base: 96.4, amp: 1.3, period: 9, phase: 3, min: 93, max: 99 }),
  skinTempVar: series({ base: 0.0, amp: 0.5, period: 10, phase: 1.5, decimals: 1 }),
  respiratoryRate: series({ base: 14.4, amp: 0.9, period: 8, phase: 2.6, decimals: 1 }),
  steps: series({ base: 9200, amp: 3600, period: 4, phase: 0.2, min: 2200 }),
  cardioLoad: series({ base: 11, amp: 5, period: 4, phase: 0.9, min: 1, max: 21 }),
};

// Last night's sleep architecture (minutes).
export const mockStages: StageSlice[] = [
  { key: "awake", label: "Awake", minutes: 28, color: "var(--color-muted)" },
  { key: "rem", label: "REM", minutes: 96, color: "var(--color-exertion)" },
  { key: "light", label: "Light", minutes: 232, color: "#3a6df0" },
  { key: "deep", label: "Deep", minutes: 78, color: "#7b5bff" },
];

// Demo flourish: trend the recovery inputs favorably into "today" so the latest
// day reads as a coherent strong day (HRV up, resting HR down, sleep up) —
// which the computed readiness then reflects.
(() => {
  const RECENT = 5;
  const n = mockSeries.hrv.length;
  for (let k = 0; k < RECENT; k++) {
    const i = n - 1 - k;
    const w = (RECENT - k) / RECENT; // strongest at today, fading back
    mockSeries.hrv[i].value = Math.round(mockSeries.hrv[i].value + 18 * w);
    mockSeries.restingHr[i].value = Math.round(mockSeries.restingHr[i].value - 6 * w);
    mockSeries.sleepScore[i].value = Math.min(
      99,
      Math.round(mockSeries.sleepScore[i].value + 11 * w),
    );
  }
})();

// Last night's stage timeline (minutes from sleep onset) — a realistic cyclic
// structure for the hypnogram.
export const mockHypnogram: SleepSegment[] = [
  { stage: "awake", start: 0, end: 6 },
  { stage: "light", start: 6, end: 40 },
  { stage: "deep", start: 40, end: 95 },
  { stage: "light", start: 95, end: 130 },
  { stage: "rem", start: 130, end: 158 },
  { stage: "light", start: 158, end: 205 },
  { stage: "deep", start: 205, end: 238 },
  { stage: "light", start: 238, end: 278 },
  { stage: "rem", start: 278, end: 312 },
  { stage: "awake", start: 312, end: 320 },
  { stage: "light", start: 320, end: 364 },
  { stage: "rem", start: 364, end: 400 },
  { stage: "light", start: 400, end: 434 },
  { stage: "awake", start: 434, end: 446 },
];

// Today's heart rate, every 5 minutes (deterministic).
export const mockIntradayHr: IntradayPoint[] = Array.from({ length: 288 }, (_, i) => {
  const min = i * 5;
  const h = min / 60;
  const sleeping = h < 6.5 || h >= 23;
  let v = sleeping ? 52 : 64;
  v += 6 * Math.sin((h / 3.8) * Math.PI * 2);
  v += 4 * Math.sin(h * 1.7);
  if (h >= 17.8 && h <= 18.7) v += 46 * Math.exp(-((h - 18.25) ** 2) / 0.03); // evening workout
  if (h >= 12.2 && h <= 12.7) v += 14; // midday walk
  v = Math.max(46, Math.min(178, v));
  return {
    t: `${String(Math.floor(h)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`,
    value: Math.round(v),
  };
});

export function demoDataset(): Dataset {
  return {
    series: mockSeries,
    stages: mockStages,
    hypnogram: mockHypnogram,
    intradayHr: mockIntradayHr,
    demo: true,
  };
}

// ── derivations (operate on any Point[]) ────────────────────────────────────
export const latest = (p: Point[]) => p[p.length - 1].value;
export const prev = (p: Point[]) => p[p.length - 2].value;
export const delta = (p: Point[]) => +(latest(p) - prev(p)).toFixed(2);
export const avg = (p: Point[], n = 7) => {
  const s = p.slice(-n);
  return s.reduce((a, b) => a + b.value, 0) / s.length;
};

export function prettyDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const todayISO = BASE_ISO;

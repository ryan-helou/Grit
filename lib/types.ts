// Shared shapes used by both the mock (demo) source and the real DB source, so
// the dashboard renders identically regardless of where data comes from.

export type Point = { date: string; value: number };

export type MetricKey =
  | "readiness"
  | "hrv"
  | "restingHr"
  | "sleepScore"
  | "sleepHours"
  | "spo2"
  | "skinTempVar"
  | "respiratoryRate"
  | "steps"
  | "cardioLoad";

export type Series = Record<MetricKey, Point[]>;

export type StageSlice = {
  key: string;
  label: string;
  minutes: number;
  color: string;
};

/** One stage block in the night's hypnogram, in minutes from sleep onset. */
export type SleepSegment = {
  stage: "awake" | "rem" | "light" | "deep";
  start: number;
  end: number;
};

/** Minute/5-minute sample within a single day, time as "HH:MM". */
export type IntradayPoint = { t: string; value: number };

export type Dataset = {
  series: Series;
  stages: StageSlice[];
  hypnogram: SleepSegment[];
  intradayHr: IntradayPoint[];
  /** true when showing seeded demo data (no DB / not yet synced). */
  demo: boolean;
};

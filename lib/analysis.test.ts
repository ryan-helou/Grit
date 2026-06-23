import { describe, it, expect } from "vitest";
import { mean, stdev, pearson, zScore, slope, baseline } from "./stats";
import {
  trainingLoad,
  scatterPair,
  readinessCorrelations,
  byWeekday,
  weekReview,
} from "./analysis";
import { computeReadinessSeries } from "./readiness-compute";
import { buildInsights } from "./insights";
import { mockSeries } from "./mock-data";
import type { Point } from "./types";

const pts = (nums: number[]): Point[] =>
  nums.map((v, i) => ({ date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, value: v }));

describe("stats", () => {
  it("mean and stdev", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(stdev([4, 4, 4])).toBe(0);
    expect(stdev([2, 4, 6])).toBeCloseTo(1.633, 2);
  });

  it("pearson is +1 / -1 for perfectly (anti)correlated series", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 5);
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 5);
  });

  it("slope sign tracks direction", () => {
    expect(slope(pts([1, 2, 3, 4, 5]))).toBeGreaterThan(0);
    expect(slope(pts([5, 4, 3, 2, 1]))).toBeLessThan(0);
  });

  it("zScore is 0 on a flat series and baseline is the mean", () => {
    expect(zScore(pts([10, 10, 10, 10]))).toBe(0);
    expect(baseline(pts([2, 4, 6]), 3)).toBe(4);
  });
});

describe("training load (ACWR)", () => {
  it("flat load → ratio ~1 and optimal", () => {
    const { ratio, status } = trainingLoad(pts(Array(28).fill(10)));
    expect(ratio).toBeCloseTo(1, 5);
    expect(status).toBe("optimal");
  });

  it("a sharp recent spike flags high risk", () => {
    const load = pts([...Array(21).fill(5), ...Array(7).fill(20)]);
    expect(trainingLoad(load).status).toBe("high");
  });
});

describe("scatterPair", () => {
  it("recovers a perfect linear fit", () => {
    const { r, m } = scatterPair(pts([1, 2, 3, 4]), pts([3, 5, 7, 9]));
    expect(r).toBeCloseTo(1, 5);
    expect(m).toBeCloseTo(2, 5);
  });
});

describe("readiness composite", () => {
  it("stays within bounds and matches series length", () => {
    const r = computeReadinessSeries(mockSeries);
    expect(r).toHaveLength(mockSeries.hrv.length);
    for (const p of r) {
      expect(p.value).toBeGreaterThanOrEqual(6);
      expect(p.value).toBeLessThanOrEqual(99);
    }
  });

  it("HRV correlates positively and resting HR negatively with readiness", () => {
    const series = { ...mockSeries, readiness: computeReadinessSeries(mockSeries) };
    const byKey = Object.fromEntries(readinessCorrelations(series).map((d) => [d.key, d.r]));
    expect(byKey.hrv).toBeGreaterThan(0);
    expect(byKey.restingHr).toBeLessThan(0);
  });
});

describe("aggregations", () => {
  it("byWeekday returns 7 buckets", () => {
    expect(byWeekday(mockSeries.steps)).toHaveLength(7);
  });

  it("weekReview returns current and prior week means", () => {
    const rows = weekReview(mockSeries);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(Number.isFinite(row.cur)).toBe(true);
      expect(Number.isFinite(row.prev)).toBe(true);
    }
  });
});

describe("insights", () => {
  it("returns at most four well-formed insights", () => {
    const series = { ...mockSeries, readiness: computeReadinessSeries(mockSeries) };
    const insights = buildInsights(series);
    expect(insights.length).toBeLessThanOrEqual(4);
    for (const ins of insights) {
      expect(ins.title.length).toBeGreaterThan(0);
      expect(["good", "bad", "neutral"]).toContain(ins.tone);
    }
  });
});

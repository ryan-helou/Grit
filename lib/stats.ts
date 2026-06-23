import type { Point } from "./types";

export const vals = (p: Point[]): number[] => p.map((x) => x.value);

export const mean = (a: number[]): number =>
  a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

export const stdev = (a: number[]): number => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
};

export const minOf = (a: number[]) => (a.length ? Math.min(...a) : 0);
export const maxOf = (a: number[]) => (a.length ? Math.max(...a) : 0);

/** Rolling baseline = mean of the last n samples. */
export function baseline(p: Point[], n = 30): number {
  return mean(vals(p).slice(-n));
}

/** How many standard deviations today sits from the recent baseline. */
export function zScore(p: Point[], n = 30): number {
  const recent = vals(p).slice(-n);
  const sd = stdev(recent);
  return sd ? (p[p.length - 1].value - mean(recent)) / sd : 0;
}

/** Least-squares slope (units per day) over the last n samples. */
export function slope(p: Point[], n = p.length): number {
  const a = vals(p).slice(-n);
  const N = a.length;
  if (N < 2) return 0;
  const xm = (N - 1) / 2;
  const ym = mean(a);
  let num = 0;
  let den = 0;
  for (let i = 0; i < N; i++) {
    num += (i - xm) * (a[i] - ym);
    den += (i - xm) ** 2;
  }
  return den ? num / den : 0;
}

/** Pearson correlation of two equal-length(ish) series. */
export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const ax = a.slice(0, n);
  const bx = b.slice(0, n);
  const ma = mean(ax);
  const mb = mean(bx);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const u = ax[i] - ma;
    const v = bx[i] - mb;
    num += u * v;
    da += u * u;
    db += v * v;
  }
  const d = Math.sqrt(da * db);
  return d ? num / d : 0;
}

export function bestWorst(p: Point[], n = 30): { best: Point; worst: Point } {
  const s = p.slice(-n);
  let best = s[0];
  let worst = s[0];
  for (const x of s) {
    if (x.value > best.value) best = x;
    if (x.value < worst.value) worst = x;
  }
  return { best, worst };
}

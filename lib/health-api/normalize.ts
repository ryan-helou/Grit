import type { Point } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO(verify): adapt to the real Google Health API response schema. This
// defensively handles a plausible shape:
//   { dataPoints: [{ date|startTime, value|aggregate|values:[{intVal|fpVal}] }] }
export function toPoints(json: any): Point[] {
  const rows: any[] = json?.dataPoints ?? json?.points ?? json?.data ?? [];
  return rows
    .map((r) => ({
      date: String(r.date ?? r.startTime ?? r.start ?? "").slice(0, 10),
      value: Number(
        r.value ??
          r.aggregate ??
          r.values?.[0]?.fpVal ??
          r.values?.[0]?.intVal ??
          0,
      ),
    }))
    .filter((p) => p.date && Number.isFinite(p.value));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

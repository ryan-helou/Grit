import { getDashboard } from "@/lib/data";
import { METRICS } from "@/lib/metrics";
import type { MetricKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Your data, your file. One row per day, every metric as a column.
export async function GET() {
  const { series } = await getDashboard();
  const keys: MetricKey[] = ["readiness", ...METRICS.map((m) => m.key)];
  const dates = series.readiness.map((p) => p.date);

  const header = ["date", ...keys].join(",");
  const lines = dates.map((date, i) =>
    [date, ...keys.map((k) => series[k][i]?.value ?? "")].join(","),
  );
  const csv = [header, ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="grit-export.csv"',
    },
  });
}

import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { DemoBadge } from "@/components/demo-badge";
import { TrainingLoad } from "@/components/training-load";
import { getDashboard } from "@/lib/data";
import { latest } from "@/lib/mock-data";

function weekday(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export default async function Activity() {
  const { series, demo } = await getDashboard();
  const readiness = latest(series.readiness);
  const week = series.steps.slice(-7);
  const max = Math.max(...week.map((d) => d.value));
  const weekTotal = week.reduce((a, d) => a + d.value, 0);

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Activity" title="This week" trailing={demo ? <DemoBadge /> : undefined} />

      <section className="card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Steps · last 7 days</span>
          <span className="text-sm text-muted">
            <span className="font-display font-bold text-fg tnum">
              {weekTotal.toLocaleString("en-US")}
            </span>{" "}
            total
          </span>
        </div>
        <div className="mt-5 flex h-40 items-end gap-2">
          {week.map((d) => (
            <div
              key={d.date}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full rounded-t-md bg-exertion/80"
                style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
                title={`${d.value.toLocaleString("en-US")} steps`}
              />
              <span className="eyebrow text-faint">{weekday(d.date)}</span>
            </div>
          ))}
        </div>
      </section>

      <h2 className="eyebrow mb-3 mt-9">Training load</h2>
      <TrainingLoad load={series.cardioLoad} />

      <h2 className="eyebrow mb-3 mt-9">Activity trends</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard metricKey="steps" series={series} readiness={readiness} />
        <MetricCard metricKey="cardioLoad" series={series} readiness={readiness} />
      </div>
    </div>
  );
}

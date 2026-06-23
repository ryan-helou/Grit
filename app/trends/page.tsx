import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { DemoBadge } from "@/components/demo-badge";
import { WeekReview } from "@/components/week-review";
import { ReadinessDriversRanked } from "@/components/readiness-drivers-ranked";
import { getDashboard } from "@/lib/data";
import { latest } from "@/lib/mock-data";
import { METRICS } from "@/lib/metrics";

export default async function Trends() {
  const { series, demo } = await getDashboard();
  const readiness = latest(series.readiness);
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Trends"
        title="Last 30 days"
        trailing={demo ? <DemoBadge /> : <span className="text-xs text-muted">Updated daily</span>}
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <WeekReview series={series} />
        <ReadinessDriversRanked series={series} />
      </div>

      <h2 className="eyebrow mb-3 mt-9">All metrics</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <MetricCard key={m.key} metricKey={m.key} series={series} readiness={readiness} />
        ))}
      </div>
    </div>
  );
}

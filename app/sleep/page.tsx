import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { DemoBadge } from "@/components/demo-badge";
import { Hypnogram } from "@/components/hypnogram";
import { getDashboard } from "@/lib/data";
import { latest } from "@/lib/mock-data";
import { scoreColorVar } from "@/lib/readiness";

function hm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default async function Sleep() {
  const { series, stages, hypnogram, demo } = await getDashboard();
  const readiness = latest(series.readiness);
  const score = latest(series.sleepScore);
  const total = stages.reduce((a, s) => a + s.minutes, 0);
  const awake = stages.find((s) => s.key === "awake")?.minutes ?? 0;
  const asleep = total - awake;

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Sleep" title="Last night" trailing={demo ? <DemoBadge /> : undefined} />

      <section className="card rounded-2xl p-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">Sleep score</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className="font-display text-5xl font-extrabold tnum"
                style={{ color: scoreColorVar(score) }}
              >
                {score}
              </span>
              <span className="text-sm text-muted">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <span className="eyebrow">Time asleep</span>
            <p className="mt-1.5 font-display text-2xl font-bold tnum">{hm(asleep)}</p>
          </div>
        </div>

        {/* stacked stage bar */}
        <div className="mt-6 flex h-4 overflow-hidden rounded-full">
          {stages.map((s) => (
            <div
              key={s.key}
              style={{ width: `${(s.minutes / total) * 100}%`, background: s.color }}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {stages.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-sm text-muted">{s.label}</span>
              <span className="ml-auto text-sm font-medium tnum">{hm(s.minutes)}</span>
            </div>
          ))}
        </div>
      </section>

      <h2 className="eyebrow mb-3 mt-9">Last night&apos;s stages</h2>
      <div className="card rounded-2xl p-5">
        <Hypnogram segments={hypnogram} />
      </div>

      <h2 className="eyebrow mb-3 mt-9">Sleep trends</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard metricKey="sleepScore" series={series} readiness={readiness} />
        <MetricCard metricKey="sleepHours" series={series} readiness={readiness} />
        <MetricCard metricKey="restingHr" series={series} readiness={readiness} />
        <MetricCard metricKey="respiratoryRate" series={series} readiness={readiness} />
      </div>
    </div>
  );
}

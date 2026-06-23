import { ReadinessRing } from "@/components/readiness-ring";
import { VitalsStrip, type Vital } from "@/components/vitals-strip";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { DemoBadge, SyncedBadge } from "@/components/demo-badge";
import { ReadinessBreakdown } from "@/components/readiness-breakdown";
import { InsightsList } from "@/components/insights-list";
import { getDashboard } from "@/lib/data";
import { latest, prettyDate, todayISO } from "@/lib/mock-data";
import { band, scoreColorVar } from "@/lib/readiness";
import { readinessDrivers } from "@/lib/readiness-compute";
import { buildInsights } from "@/lib/insights";

const SUMMARY: Record<ReturnType<typeof band>, string> = {
  high: "Your body is recovered. Today's a good day to push hard.",
  mid: "Moderately recovered — train, but keep an ear on your body.",
  low: "Low recovery. Prioritize rest, hydration, and easy movement.",
};

export default async function Today() {
  const { series, demo } = await getDashboard();
  const readiness = latest(series.readiness);
  const accent = scoreColorVar(readiness);
  const skin = latest(series.skinTempVar);
  const drivers = readinessDrivers(series);
  const insights = buildInsights(series);

  const vitals: Vital[] = [
    { label: "HRV", value: latest(series.hrv), unit: "ms", color: accent },
    { label: "Resting HR", value: latest(series.restingHr), unit: "bpm", color: accent },
    { label: "SpO₂", value: latest(series.spo2), unit: "%", color: accent },
    {
      label: "Skin Temp",
      value: `${skin > 0 ? "+" : ""}${skin.toFixed(1)}`,
      unit: "°C",
      color: accent,
    },
    {
      label: "Resp Rate",
      value: latest(series.respiratoryRate).toFixed(1),
      unit: "br/min",
      color: accent,
    },
  ];

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Today"
        title={prettyDate(todayISO)}
        trailing={demo ? <DemoBadge /> : <SyncedBadge />}
      />

      <section className="flex flex-col items-center pt-2">
        <ReadinessRing score={readiness} />
        <p className="mt-5 max-w-xs text-center text-sm leading-relaxed text-muted">
          {SUMMARY[band(readiness)]}
        </p>
      </section>

      <div className="mt-7">
        <ReadinessBreakdown drivers={drivers} />
      </div>

      <h2 className="eyebrow mb-3 mt-9">This morning&apos;s vitals</h2>
      <VitalsStrip items={vitals} />

      <h2 className="eyebrow mb-3 mt-9">Highlights</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard metricKey="sleepScore" series={series} readiness={readiness} />
        <MetricCard metricKey="sleepHours" series={series} readiness={readiness} />
        <MetricCard metricKey="steps" series={series} readiness={readiness} />
        <MetricCard metricKey="cardioLoad" series={series} readiness={readiness} />
      </div>

      {insights.length > 0 && (
        <>
          <h2 className="eyebrow mb-3 mt-9">Insights</h2>
          <InsightsList insights={insights} />
        </>
      )}
    </div>
  );
}

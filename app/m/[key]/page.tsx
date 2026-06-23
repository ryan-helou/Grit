import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { DemoBadge } from "@/components/demo-badge";
import { MetricDetail } from "@/components/metric-detail";
import { Scatter } from "@/components/scatter";
import { WeekdayBars } from "@/components/weekday-bars";
import { getDashboard } from "@/lib/data";
import { latest } from "@/lib/mock-data";
import { metric, accentColor, METRICS } from "@/lib/metrics";
import type { MetricKey } from "@/lib/types";

export default async function MetricPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { key } = await params;
  if (!METRICS.some((m) => m.key === key)) notFound();

  const { range } = await searchParams;
  const mk = key as MetricKey;
  const def = metric(mk);
  const { series, intradayHr, demo } = await getDashboard();
  const readiness = latest(series.readiness);
  const color = accentColor(def, readiness);
  const intraday =
    mk === "restingHr" ? intradayHr.map((p) => ({ date: p.t, value: p.value })) : undefined;

  return (
    <div className="animate-rise">
      <div className="mb-5 flex items-center justify-between">
        <BackLink href="/trends" label="Trends" />
        {demo && <DemoBadge />}
      </div>

      <header className="mb-6">
        <span className="eyebrow">{def.accent === "exertion" ? "Exertion" : "Recovery"}</span>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight">{def.label}</h1>
      </header>

      <MetricDetail
        data={series[mk]}
        color={color}
        unit={def.unit ?? ""}
        decimals={def.decimals ?? 0}
        intraday={intraday}
        initialRange={range ? Number(range) : 30}
      />

      {mk !== "readiness" && (
        <div className="mt-9">
          <h2 className="eyebrow mb-3">Relates to readiness</h2>
          <div className="card rounded-2xl p-4">
            <Scatter
              x={series[mk]}
              y={series.readiness}
              color={color}
              xLabel={def.label}
              yLabel="Readiness"
            />
          </div>
        </div>
      )}

      <div className="mt-9">
        <h2 className="eyebrow mb-3">By day of week</h2>
        <div className="card rounded-2xl p-5">
          <WeekdayBars data={series[mk]} color={color} decimals={def.decimals ?? 0} />
        </div>
      </div>
    </div>
  );
}

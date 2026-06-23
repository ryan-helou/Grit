import Link from "next/link";
import { metric, accentColor, changeFor, valueFor, avgFor } from "@/lib/metrics";
import type { MetricKey, Series } from "@/lib/types";
import { TrendCard } from "./trend-card";

export function MetricCard({
  metricKey,
  series,
  readiness,
}: {
  metricKey: MetricKey;
  series: Series;
  readiness: number;
}) {
  const def = metric(metricKey);
  return (
    <Link
      href={`/m/${metricKey}`}
      className="block transition-transform hover:-translate-y-0.5"
    >
      <TrendCard
        label={def.label}
        unit={def.unit}
        value={valueFor(def, series)}
        data={series[def.key].slice(-30)}
        accentVar={accentColor(def, readiness)}
        change={changeFor(def, series)}
        footer={`7-day avg ${avgFor(def, series)}${def.unit ? " " + def.unit : ""}`}
      />
    </Link>
  );
}

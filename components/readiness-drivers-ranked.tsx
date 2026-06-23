import { readinessCorrelations } from "@/lib/analysis";
import { metric } from "@/lib/metrics";
import type { Series } from "@/lib/types";

// Ranks each metric by how strongly it correlates with daily readiness.
export function ReadinessDriversRanked({ series }: { series: Series }) {
  const rows = readinessCorrelations(series).slice(0, 6);

  return (
    <div className="card rounded-2xl p-5">
      <span className="eyebrow">What moves your readiness</span>
      <p className="mb-3 mt-1 text-xs text-faint">Correlation with daily readiness, last 90 days</p>
      <div className="flex flex-col gap-2.5">
        {rows.map(({ key, r }) => {
          const def = metric(key);
          const pos = r >= 0;
          const w = Math.min(100, Math.abs(r) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-muted">{def.label}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${w}%`,
                    background: pos ? "var(--color-ready-high)" : "var(--color-ready-low)",
                  }}
                />
              </div>
              <span className="w-12 text-right text-xs tnum text-muted">
                {r >= 0 ? "+" : ""}
                {r.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

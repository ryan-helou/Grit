import { trainingLoad, LOAD_COPY } from "@/lib/analysis";
import type { Point } from "@/lib/types";

const TONE: Record<"good" | "bad" | "neutral", string> = {
  good: "text-ready-high",
  bad: "text-ready-low",
  neutral: "text-ready-mid",
};

export function TrainingLoad({ load }: { load: Point[] }) {
  const { acute, chronic, ratio, status } = trainingLoad(load);
  const copy = LOAD_COPY[status];
  const tone = TONE[copy.tone];
  const pct = Math.max(0, Math.min(100, (ratio / 2) * 100)); // ratio 0–2 → 0–100%

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Training load · acute : chronic</span>
        <span className={`text-xs font-semibold ${tone}`}>{copy.label}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-display text-4xl font-bold tnum ${tone}`}>
          {ratio.toFixed(2)}
        </span>
        <span className="text-sm text-muted">acute : chronic ratio</span>
      </div>

      {/* zone bar with the 0.8–1.3 "optimal" band highlighted */}
      <div className="relative mt-5 h-2 rounded-full bg-surface-2">
        <div
          className="absolute inset-y-0 rounded-full bg-ready-high/30"
          style={{ left: `${(0.8 / 2) * 100}%`, width: `${((1.3 - 0.8) / 2) * 100}%` }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex justify-between text-xs text-muted">
        <span>
          7-day <b className="font-display text-fg tnum">{acute.toFixed(1)}</b>
        </span>
        <span>
          28-day <b className="font-display text-fg tnum">{chronic.toFixed(1)}</b>
        </span>
      </div>
    </div>
  );
}

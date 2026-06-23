import { byWeekday } from "@/lib/analysis";
import type { Point } from "@/lib/types";

const LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function WeekdayBars({
  data,
  color,
  decimals = 0,
}: {
  data: Point[];
  color: string;
  decimals?: number;
}) {
  const avg = byWeekday(data); // index 0 = Sunday
  const nonzero = avg.filter((v) => v > 0);
  const max = Math.max(...avg);
  const min = nonzero.length ? Math.min(...nonzero) : 0;
  const fmt = (v: number) => (decimals ? v.toFixed(decimals) : Math.round(v).toString());

  return (
    <div className="flex h-32 items-end gap-2">
      {avg.map((v, i) => (
        <div
          key={i}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div
            className="w-full rounded-t-md"
            style={{
              height: `${max ? Math.max(6, ((v - min) / (max - min || 1)) * 100) : 6}%`,
              background: color,
              opacity: 0.85,
            }}
            title={`${LABELS[i]}: ${fmt(v)}`}
          />
          <span className="eyebrow text-faint">{LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
}

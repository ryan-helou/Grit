import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { weekReview } from "@/lib/analysis";
import type { Series } from "@/lib/types";

export function WeekReview({ series }: { series: Series }) {
  const rows = weekReview(series);
  const fmt = (v: number, d = 0) =>
    d ? v.toFixed(d) : Math.round(v).toLocaleString("en-US");

  return (
    <div className="card rounded-2xl p-5">
      <span className="eyebrow">This week vs last</span>
      <div className="mt-2 divide-y divide-border">
        {rows.map((r) => {
          const diff = r.cur - r.prev;
          const pct = r.prev ? (diff / r.prev) * 100 : 0;
          const dir = Math.abs(pct) < 1 ? "flat" : diff > 0 ? "up" : "down";
          const good = dir === "flat" ? true : r.betterUp ? diff > 0 : diff < 0;
          const Icon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
          const tone =
            dir === "flat" ? "text-muted" : good ? "text-ready-high" : "text-ready-low";
          return (
            <div key={r.key} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted">{r.label}</span>
              <div className="flex items-center gap-3">
                <span className="font-display text-base font-bold tnum">
                  {fmt(r.cur, r.decimals)}
                  {r.unit ?? ""}
                </span>
                <span
                  className={`flex w-14 items-center justify-end gap-0.5 text-xs font-medium tnum ${tone}`}
                >
                  <Icon size={12} strokeWidth={2.5} />
                  {Math.abs(pct).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

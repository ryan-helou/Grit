import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Driver } from "@/lib/readiness-compute";

export function ReadinessBreakdown({ drivers }: { drivers: Driver[] }) {
  return (
    <div className="card rounded-2xl p-5">
      <span className="eyebrow">What&apos;s driving it</span>
      <ul className="mt-4 flex flex-col gap-3.5">
        {drivers.map((d) => {
          const Icon =
            d.impact === "up" ? ArrowUp : d.impact === "down" ? ArrowDown : Minus;
          const tone =
            d.impact === "up"
              ? "text-ready-high"
              : d.impact === "down"
                ? "text-ready-low"
                : "text-muted";
          return (
            <li key={d.label} className="flex items-center gap-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ${tone}`}
              >
                <Icon size={15} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-medium">{d.label}</span>
              <span className="ml-auto text-right text-xs text-muted tnum">
                {d.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

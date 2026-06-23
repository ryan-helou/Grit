import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { type Point } from "@/lib/types";
import { type Change } from "@/lib/metrics";
import { Sparkline } from "./sparkline";

export function TrendCard({
  label,
  value,
  unit,
  data,
  accentVar,
  change,
  footer,
}: {
  label: string;
  value: string | number;
  unit?: string;
  data: Point[];
  accentVar: string;
  change?: Change;
  footer?: string;
}) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {change && <ChangeChip change={change} />}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold tnum">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>

      <div className="mt-4">
        <Sparkline data={data} color={accentVar} />
      </div>

      {footer && <p className="eyebrow mt-3 text-faint">{footer}</p>}
    </div>
  );
}

function ChangeChip({ change }: { change: Change }) {
  const Icon = change.dir === "up" ? ArrowUp : change.dir === "down" ? ArrowDown : Minus;
  const tone =
    change.dir === "flat"
      ? "text-muted"
      : change.good
        ? "text-ready-high"
        : "text-ready-low";
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium tnum ${tone}`}>
      <Icon size={13} strokeWidth={2.5} />
      {change.value}
    </span>
  );
}

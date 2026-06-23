"use client";

import { useState } from "react";
import { Chart } from "./chart";
import { StatGrid } from "./stat-grid";
import { vals, mean, minOf, maxOf, baseline } from "@/lib/stats";
import type { Point } from "@/lib/types";

const RANGES = [7, 30, 90, 365];

export function MetricDetail({
  data,
  color,
  unit = "",
  decimals = 0,
  intraday,
  initialRange = 30,
}: {
  data: Point[];
  color: string;
  unit?: string;
  decimals?: number;
  intraday?: Point[];
  initialRange?: number;
}) {
  const [range, setRange] = useState(RANGES.includes(initialRange) ? initialRange : 30);
  const slice = data.slice(-range);
  const v = vals(slice);
  const base = baseline(data, 30);
  const fmt = (n: number) =>
    decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");

  const stats = [
    { label: "Latest", value: `${fmt(slice[slice.length - 1].value)}${unit ? " " + unit : ""}` },
    { label: "Average", value: fmt(mean(v)) },
    { label: "Range", value: `${fmt(minOf(v))}–${fmt(maxOf(v))}` },
    { label: "Baseline", value: fmt(base) },
  ];

  return (
    <>
      <div className="mb-4 flex gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              range === r ? "bg-fg text-bg" : "card text-muted hover:text-fg"
            }`}
          >
            {r === 365 ? "1y" : `${r}d`}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl p-4">
        <Chart data={slice} color={color} unit={unit} decimals={decimals} baseline={base} />
      </div>

      <div className="mt-4">
        <StatGrid stats={stats} />
      </div>

      {intraday && intraday.length > 0 && (
        <div className="mt-9">
          <h2 className="eyebrow mb-3">Today, minute by minute</h2>
          <div className="card rounded-2xl p-4">
            <Chart data={intraday} color={color} unit={unit} decimals={decimals} xMode="raw" />
          </div>
        </div>
      )}
    </>
  );
}

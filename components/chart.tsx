"use client";

import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/types";

export function Chart({
  data,
  color,
  height = 210,
  unit = "",
  decimals = 0,
  baseline,
  xMode = "date",
}: {
  data: Point[];
  color: string;
  height?: number;
  unit?: string;
  decimals?: number;
  baseline?: number;
  /** "date" formats the `date` field as M/D; "raw" uses it verbatim (e.g. HH:MM). */
  xMode?: "date" | "raw";
}) {
  const labelFor = (s: string) => (xMode === "raw" ? s : shortDate(s));
  const tipFor = (s: string) => (xMode === "raw" ? s : longDate(s));
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(680);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      if (cw) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padL = 38;
  const padR = 8;
  const padT = 14;
  const padB = 22;
  const vs = data.map((d) => d.value);
  const lo = Math.min(...vs, baseline ?? Infinity);
  const hi = Math.max(...vs, baseline ?? -Infinity);
  const span = hi - lo || 1;
  const plotW = Math.max(1, w - padL - padR);
  const plotH = height - padT - padB;
  const x = (i: number) => padL + (i * plotW) / Math.max(1, data.length - 1);
  const y = (v: number) => padT + (1 - (v - lo) / span) * plotH;

  const line = vs
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(vs.length - 1).toFixed(1)},${padT + plotH} L${x(0).toFixed(1)},${padT + plotH} Z`;
  const ticks = pickTicks(data, w, labelFor);

  const onMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const i = Math.round(((e.clientX - rect.left - padL) / plotW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const fmt = (v: number) =>
    decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");

  return (
    <div
      ref={ref}
      className="relative w-full touch-none select-none"
      style={{ height }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg width={w} height={height} className="block">
        {[0, 0.5, 1].map((f) => {
          const gy = padT + f * plotH;
          return (
            <g key={f}>
              <line
                x1={padL}
                x2={w - padR}
                y1={gy}
                y2={gy}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={padL - 6}
                y={gy + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-faint)"
                className="font-mono"
              >
                {fmt(hi - f * span)}
              </text>
            </g>
          );
        })}
        {baseline != null && (
          <line
            x1={padL}
            x2={w - padR}
            y1={y(baseline)}
            y2={y(baseline)}
            stroke="var(--color-muted)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        )}
        <path d={area} fill={color} opacity={0.1} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hover != null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={padT + plotH}
              stroke="var(--color-muted)"
              strokeWidth={1}
            />
            <circle
              cx={x(hover)}
              cy={y(vs[hover])}
              r={4}
              fill={color}
              stroke="var(--color-bg)"
              strokeWidth={2}
            />
          </>
        )}
        {ticks.map((t) => (
          <text
            key={t.i}
            x={x(t.i)}
            y={height - 6}
            fontSize={10}
            fill="var(--color-faint)"
            textAnchor="middle"
            className="font-mono"
          >
            {t.label}
          </text>
        ))}
      </svg>

      {hover != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-center"
          style={{
            left: Math.max(34, Math.min(w - 34, x(hover))),
            top: Math.max(0, y(vs[hover]) - 52),
          }}
        >
          <div className="font-display text-sm font-bold tnum" style={{ color }}>
            {fmt(vs[hover])}
            {unit}
          </div>
          <div className="eyebrow mt-0.5 text-[0.6rem]">{tipFor(data[hover].date)}</div>
        </div>
      )}
    </div>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function longDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function pickTicks(
  data: Point[],
  w: number,
  labelFor: (s: string) => string,
): { i: number; label: string }[] {
  const n = data.length;
  if (n === 0) return [];
  const count = w < 420 ? 3 : 5;
  const step = Math.max(1, Math.floor((n - 1) / (count - 1)));
  const out: { i: number; label: string }[] = [];
  for (let i = 0; i < n; i += step) out.push({ i, label: labelFor(data[i].date) });
  if (out[out.length - 1]?.i !== n - 1)
    out.push({ i: n - 1, label: labelFor(data[n - 1].date) });
  return out;
}

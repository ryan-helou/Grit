import { scatterPair } from "@/lib/analysis";
import type { Point } from "@/lib/types";

// Scatter of two metrics with a least-squares fit line + correlation — the
// "how does X relate to my readiness" view.
export function Scatter({
  x,
  y,
  color,
  xLabel,
  yLabel,
}: {
  x: Point[];
  y: Point[];
  color: string;
  xLabel: string;
  yLabel: string;
}) {
  const { pts, r, m, b } = scatterPair(x, y);
  if (pts.length < 3) return null;

  const W = 1000;
  const H = 600;
  const padL = 70;
  const padR = 24;
  const padT = 30;
  const padB = 66;

  const xsv = pts.map((p) => p.x);
  const ysv = pts.map((p) => p.y);
  const xmin = Math.min(...xsv);
  const xmax = Math.max(...xsv);
  const ymin = Math.min(...ysv);
  const ymax = Math.max(...ysv);
  const sx = (v: number) => padL + ((v - xmin) / (xmax - xmin || 1)) * (W - padL - padR);
  const sy = (v: number) => padT + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - padT - padB);


  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--color-border)" strokeWidth={1.5} />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--color-border)" strokeWidth={1.5} />

      <line
        x1={sx(xmin)}
        y1={sy(m * xmin + b)}
        x2={sx(xmax)}
        y2={sy(m * xmax + b)}
        stroke={color}
        strokeWidth={3}
        strokeDasharray="7 7"
        opacity={0.85}
      />

      {pts.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={7} fill={color} opacity={0.45} />
      ))}

      <text x={(padL + W - padR) / 2} y={H - 12} textAnchor="middle" fontSize={26} fill="var(--color-muted)" className="font-mono">
        {xLabel}
      </text>
      <text x={22} y={(padT + H - padB) / 2} textAnchor="middle" fontSize={26} fill="var(--color-muted)" transform={`rotate(-90 22 ${(padT + H - padB) / 2})`} className="font-mono">
        {yLabel}
      </text>
      <text x={W - padR} y={padT + 6} textAnchor="end" fontSize={28} fontWeight={700} fill={color} className="font-mono">
        r = {r >= 0 ? "+" : ""}{r.toFixed(2)}
      </text>
    </svg>
  );
}

import { type Point } from "@/lib/types";

export function Sparkline({
  data,
  color,
  width = 280,
  height = 56,
  area = true,
}: {
  data: Point[];
  color: string; // CSS color or var()
  width?: number;
  height?: number;
  area?: boolean;
}) {
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pad = 5;
  const x = (i: number) => pad + (i * (width - 2 * pad)) / (data.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - 2 * pad);

  const line = vals
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const fillPath = `${line} L${x(vals.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  const lastX = x(vals.length - 1);
  const lastY = y(vals[vals.length - 1]);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block"
      aria-hidden="true"
    >
      {area && <path d={fillPath} fill={color} opacity={0.1} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={color} />
    </svg>
  );
}

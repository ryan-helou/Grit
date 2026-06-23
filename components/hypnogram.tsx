import type { SleepSegment } from "@/lib/types";

const LEVEL: Record<SleepSegment["stage"], number> = { deep: 0, light: 1, rem: 2, awake: 3 };
const COLOR: Record<SleepSegment["stage"], string> = {
  awake: "var(--color-muted)",
  rem: "var(--color-exertion)",
  light: "#3a6df0",
  deep: "#7b5bff",
};
const LABEL: Record<SleepSegment["stage"], string> = {
  awake: "Awake",
  rem: "REM",
  light: "Light",
  deep: "Deep",
};
const ROWS: SleepSegment["stage"][] = ["awake", "rem", "light", "deep"];

// Stepped stage timeline of the night — the kind of depth the consumer app hides.
export function Hypnogram({ segments }: { segments: SleepSegment[] }) {
  if (!segments.length) return null;
  const total = segments[segments.length - 1].end;

  const W = 1000;
  const H = 168;
  const padL = 52;
  const padR = 12;
  const padT = 10;
  const padB = 22;
  const rowH = (H - padT - padB) / 3; // 4 levels, 3 gaps
  const yOf = (s: SleepSegment["stage"]) => padT + (3 - LEVEL[s]) * rowH;
  const xOf = (min: number) => padL + (min / total) * (W - padL - padR);

  const hourTicks: number[] = [];
  for (let m = 0; m <= total; m += 120) hourTicks.push(m);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height: H }}
    >
      {/* row guides + labels */}
      {ROWS.map((s) => (
        <g key={s}>
          <line
            x1={padL}
            x2={W - padR}
            y1={yOf(s)}
            y2={yOf(s)}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text x={0} y={yOf(s) + 4} fontSize={13} fill="var(--color-muted)" className="font-mono">
            {LABEL[s]}
          </text>
        </g>
      ))}

      {/* connectors between consecutive segments */}
      {segments.slice(1).map((seg, i) => {
        const prev = segments[i];
        const cx = xOf(seg.start);
        return (
          <line
            key={`c${i}`}
            x1={cx}
            x2={cx}
            y1={yOf(prev.stage)}
            y2={yOf(seg.stage)}
            stroke="var(--color-border)"
            strokeWidth={2}
          />
        );
      })}

      {/* stage segments */}
      {segments.map((seg, i) => (
        <line
          key={i}
          x1={xOf(seg.start)}
          x2={xOf(seg.end)}
          y1={yOf(seg.stage)}
          y2={yOf(seg.stage)}
          stroke={COLOR[seg.stage]}
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}

      {/* hour ticks */}
      {hourTicks.map((m) => (
        <text
          key={m}
          x={xOf(m)}
          y={H - 5}
          fontSize={11}
          fill="var(--color-faint)"
          textAnchor="middle"
          className="font-mono"
        >
          {m / 60}h
        </text>
      ))}
    </svg>
  );
}

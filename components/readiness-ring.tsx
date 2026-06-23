import { band, bandColorVar, bandText, bandWord } from "@/lib/readiness";

// The signature element: a single 0–100 readiness score. Its traffic-light
// color is the same vocabulary used across every metric on the dashboard.
export function ReadinessRing({
  score,
  size = 256,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  const b = band(score);
  const color = bandColorVar[b];

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`Readiness ${score} out of 100, ${bandWord[b]}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            strokeDasharray: c,
            strokeDashoffset: offset,
            ["--circ" as string]: String(c),
            animation: "ring-fill 1.1s cubic-bezier(.22,1,.36,1) both",
            filter: `drop-shadow(0 0 11px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="eyebrow mb-2.5">Readiness</span>
        <span className="font-display text-[5.25rem] font-extrabold leading-none tnum">
          {score}
        </span>
        <span
          className={`mt-1.5 font-display text-lg font-bold uppercase tracking-wider ${bandText[b]}`}
        >
          {bandWord[b]}
        </span>
      </div>
    </div>
  );
}

import type { Insight } from "@/lib/insights";

export function InsightsList({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  const dot = (t: Insight["tone"]) =>
    t === "good" ? "bg-ready-high" : t === "bad" ? "bg-ready-low" : "bg-muted";

  return (
    <div className="flex flex-col gap-3">
      {insights.map((ins) => (
        <div key={ins.title} className="card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${dot(ins.tone)}`} />
            <h3 className="text-sm font-semibold">{ins.title}</h3>
          </div>
          <p className="mt-1.5 pl-4 text-sm leading-relaxed text-muted">{ins.detail}</p>
        </div>
      ))}
    </div>
  );
}

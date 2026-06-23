export function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card rounded-xl px-4 py-3">
          <span className="eyebrow">{s.label}</span>
          <p className="mt-1.5 font-display text-xl font-bold tnum">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

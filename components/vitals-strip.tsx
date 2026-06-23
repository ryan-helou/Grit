export type Vital = {
  label: string;
  value: string | number;
  unit?: string;
  color?: string; // CSS color for the value
  sub?: string;
};

export function VitalsStrip({ items }: { items: Vital[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((v) => (
        <div
          key={v.label}
          className="card rounded-xl px-4 py-3"
        >
          <span className="eyebrow">{v.label}</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="font-display text-2xl font-bold tnum"
              style={v.color ? { color: v.color } : undefined}
            >
              {v.value}
            </span>
            {v.unit && <span className="text-xs text-muted">{v.unit}</span>}
          </div>
          {v.sub && <span className="eyebrow mt-1.5 block text-faint">{v.sub}</span>}
        </div>
      ))}
    </div>
  );
}

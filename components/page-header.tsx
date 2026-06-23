export function PageHeader({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-end justify-between">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight">
          {title}
        </h1>
      </div>
      {trailing}
    </header>
  );
}

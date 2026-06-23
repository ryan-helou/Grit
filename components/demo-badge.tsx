export function DemoBadge() {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted">
      Demo data
    </span>
  );
}

export function SyncedBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span className="size-2 rounded-full bg-ready-high shadow-[0_0_8px_var(--color-ready-high)]" />
      Synced
    </span>
  );
}

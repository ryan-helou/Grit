import Link from "next/link";
import { Download } from "lucide-react";
import { eq } from "drizzle-orm";
import { BackLink } from "@/components/back-link";
import { SyncButton } from "@/components/sync-button";
import { secured } from "@/lib/config";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { syncState } from "@/db/schema";

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

export default async function Settings() {
  const user = secured ? await getSessionUser() : null;
  let lastSync: Date | null = null;
  if (db && user) {
    const s = (
      await db.select().from(syncState).where(eq(syncState.userId, user.id)).limit(1)
    )[0];
    lastSync = s?.lastSyncAt ?? null;
  }

  return (
    <div className="animate-rise">
      <div className="mb-5">
        <BackLink href="/" label="Today" />
      </div>
      <header className="mb-6">
        <span className="eyebrow">Settings</span>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight">Account</h1>
      </header>

      <section className="card rounded-2xl p-5">
        <Row label="Status">
          {user ? (
            <span className="text-ready-high">Connected</span>
          ) : (
            <span className="text-ready-mid">Demo mode</span>
          )}
        </Row>
        {user && <Row label="Account">{user.email}</Row>}
        <Row label="Device">Fitbit Air</Row>
        <Row label="Data source">Google Health API</Row>
        <Row label="Last synced">
          {lastSync
            ? lastSync.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
            : user
              ? "Never"
              : "—"}
        </Row>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {secured && user && <SyncButton />}
        <a
          href="/api/export"
          download
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          <Download size={15} strokeWidth={2.25} />
          Export CSV
        </a>
        {secured && user && (
          <Link href="/api/auth/logout" className="ml-auto text-sm text-muted hover:text-fg">
            Sign out
          </Link>
        )}
      </div>

      {!secured && (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Showing seeded demo data. Configure Google + Neon (see the README) to connect your
          Fitbit Air.
        </p>
      )}
    </div>
  );
}

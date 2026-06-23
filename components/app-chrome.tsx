"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { TabNav } from "./tab-nav";

// Wraps the dashboard in its container + brand bar + bottom tab nav, but bows
// out entirely on /login so the sign-in screen owns the full viewport.
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <div className="mx-auto w-full max-w-2xl px-5 pb-32 pt-7 lg:max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-ready-high shadow-[0_0_8px_var(--color-ready-high)]" />
            <span className="font-display text-sm font-extrabold tracking-[0.22em]">
              GRIT
            </span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="text-muted transition-colors hover:text-fg"
          >
            <Settings size={18} strokeWidth={2} />
          </Link>
        </div>
        {children}
      </div>
      <TabNav />
    </>
  );
}

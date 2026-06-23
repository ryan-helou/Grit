"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, TrendingUp, Moon, Flame } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", Icon: Gauge },
  { href: "/trends", label: "Trends", Icon: TrendingUp },
  { href: "/sleep", label: "Sleep", Icon: Moon },
  { href: "/activity", label: "Activity", Icon: Flame },
];

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-1 rounded-full border border-border bg-surface/85 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              <Icon size={18} strokeWidth={2.25} />
              <span className={active ? "inline" : "hidden sm:inline"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

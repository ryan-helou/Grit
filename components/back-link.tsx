import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href = "/", label = "Back" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
    >
      <ChevronLeft size={16} strokeWidth={2.5} />
      {label}
    </Link>
  );
}

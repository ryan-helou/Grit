"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type State = "idle" | "syncing" | "done" | "error";

export function SyncButton() {
  const [state, setState] = useState<State>("idle");
  const router = useRouter();

  async function run() {
    setState("syncing");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error();
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const label =
    state === "syncing"
      ? "Syncing…"
      : state === "done"
        ? "Synced"
        : state === "error"
          ? "Failed — retry"
          : "Sync now";

  return (
    <button
      onClick={run}
      disabled={state === "syncing"}
      className="inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      <RefreshCw size={15} className={state === "syncing" ? "animate-spin" : ""} />
      {label}
    </button>
  );
}

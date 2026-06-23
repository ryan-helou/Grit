import Link from "next/link";
import { authConfigured } from "@/lib/config";

const ERRORS: Record<string, string> = {
  state: "Sign-in expired or was interrupted. Please try again.",
  not_allowed: "That Google account isn't on the allowlist for this app.",
  no_db: "The database isn't configured yet. Check your environment setup.",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      {/* ambient readiness glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[34rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-ready-high), transparent 65%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="size-3 rounded-full bg-ready-high shadow-[0_0_12px_var(--color-ready-high)]" />
          <span className="font-display text-2xl font-extrabold tracking-[0.24em]">
            GRIT
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
          Your Fitbit Air,
          <br />
          in depth.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Recovery, sleep, and strain — the full picture your band can&apos;t fit
          on a screen.
        </p>

        {error && (
          <p className="mt-6 w-full rounded-lg border border-ready-low/40 bg-ready-low/10 px-4 py-3 text-sm text-ready-low">
            {ERRORS[error] ?? "Something went wrong. Please try again."}
          </p>
        )}

        {authConfigured ? (
          <Link
            href="/api/auth/login"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-fg px-6 py-3.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            <GoogleMark />
            Continue with Google
          </Link>
        ) : (
          <div className="mt-8 w-full rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted">
            Running in <span className="text-fg">demo mode</span> — auth isn&apos;t
            configured yet.
            <Link href="/" className="mt-3 block font-medium text-ready-high">
              Open the demo dashboard →
            </Link>
          </div>
        )}

        <p className="mt-8 max-w-xs text-xs leading-relaxed text-faint">
          Personal use. Only allowlisted Google accounts can sign in, and your
          health data stays in your own database.
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

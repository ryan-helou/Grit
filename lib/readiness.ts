// Maps a 0–100 readiness/recovery score onto the Whoop-style traffic-light
// vocabulary. This same band drives the hero ring AND every metric accent, so
// the color language is learned once and applies everywhere.

export type Band = "high" | "mid" | "low";

export function band(score: number): Band {
  if (score >= 67) return "high";
  if (score >= 34) return "mid";
  return "low";
}

/** CSS variable for a band — use in inline SVG strokes/fills. */
export const bandColorVar: Record<Band, string> = {
  high: "var(--color-ready-high)",
  mid: "var(--color-ready-mid)",
  low: "var(--color-ready-low)",
};

/** Tailwind text-color class for a band. */
export const bandText: Record<Band, string> = {
  high: "text-ready-high",
  mid: "text-ready-mid",
  low: "text-ready-low",
};

/** One-word status shown under the hero score. */
export const bandWord: Record<Band, string> = {
  high: "Primed",
  mid: "Steady",
  low: "Strained",
};

export function scoreColorVar(score: number): string {
  return bandColorVar[band(score)];
}

import type { Series } from "./types";
import { vals, pearson, zScore, slope } from "./stats";

export type Insight = {
  title: string;
  detail: string;
  tone: "good" | "bad" | "neutral";
};

// Derives plain-language findings from cross-metric correlations and baseline
// deviations — the analysis that makes this "deeper than Google Health".
export function buildInsights(series: Series): Insight[] {
  const out: Insight[] = [];

  // 1) last night's sleep → next-day readiness
  const sleepToReadiness = pearson(
    vals(series.sleepScore).slice(0, -1),
    vals(series.readiness).slice(1),
  );
  if (Math.abs(sleepToReadiness) >= 0.25) {
    out.push(
      sleepToReadiness > 0
        ? {
            title: "Sleep fuels your recovery",
            detail: `Better sleep tends to precede higher next-day readiness (r=${sleepToReadiness.toFixed(2)}).`,
            tone: "good",
          }
        : {
            title: "Sleep and readiness diverge",
            detail: `Sleep score hasn't been tracking with next-day readiness lately (r=${sleepToReadiness.toFixed(2)}).`,
            tone: "neutral",
          },
    );
  }

  // 2) HRV vs baseline
  const hrvZ = zScore(series.hrv, 30);
  if (hrvZ <= -1) {
    out.push({
      title: "HRV is suppressed",
      detail: `Today's HRV is ${Math.abs(hrvZ).toFixed(1)}σ below your 30-day baseline — a sign of strain or under-recovery.`,
      tone: "bad",
    });
  } else if (hrvZ >= 1) {
    out.push({
      title: "HRV is elevated",
      detail: `Today's HRV is ${hrvZ.toFixed(1)}σ above baseline — a strong recovery signal.`,
      tone: "good",
    });
  }

  // 3) resting HR trend (last 2 weeks)
  const rhrSlope = slope(series.restingHr, 14);
  if (rhrSlope > 0.1) {
    out.push({
      title: "Resting HR creeping up",
      detail: `Up ~${(rhrSlope * 7).toFixed(1)} bpm/week recently — worth watching sleep, stress, and training load.`,
      tone: "bad",
    });
  } else if (rhrSlope < -0.1) {
    out.push({
      title: "Resting HR trending down",
      detail: `Down ~${(Math.abs(rhrSlope) * 7).toFixed(1)} bpm/week — fitness is moving the right way.`,
      tone: "good",
    });
  }

  // 4) hard days → worse sleep
  const loadToSleep = pearson(
    vals(series.cardioLoad).slice(0, -1),
    vals(series.sleepScore).slice(1),
  );
  if (loadToSleep <= -0.25) {
    out.push({
      title: "Hard days cost you sleep",
      detail: `Higher cardio load tends to precede lower sleep scores (r=${loadToSleep.toFixed(2)}).`,
      tone: "neutral",
    });
  }

  return out.slice(0, 4);
}

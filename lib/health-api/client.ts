import { getValidAccessToken } from "../auth";

export const HEALTH_API_BASE = "https://health.googleapis.com/v4";

// TODO(verify): confirm data-type identifiers in the Google Health API
// "Data Types" reference (developers.google.com/health). These names are
// best-guess placeholders — correct them before going live.
export const DATA_TYPES = {
  readiness: "com.google.health.readiness",
  hrv: "com.google.health.heart_rate_variability",
  restingHr: "com.google.health.resting_heart_rate",
  sleepScore: "com.google.health.sleep_score",
  sleepMinutes: "com.google.health.sleep_duration",
  spo2: "com.google.health.oxygen_saturation",
  skinTempVar: "com.google.health.skin_temperature",
  respiratoryRate: "com.google.health.respiratory_rate",
  steps: "com.google.health.step_count",
  cardioLoad: "com.google.health.cardio_load",
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function authedGet(
  userId: string,
  path: string,
  params: Record<string, string>,
): Promise<any> {
  const token = await getValidAccessToken(userId);
  if (!token) throw new Error("No valid Google access token for user");

  const url = new URL(HEALTH_API_BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Health API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Daily aggregates for a data type over [start, end] (YYYY-MM-DD).
// TODO(verify): exact path, query params, and pagination from the Endpoints ref.
export function listDaily(
  userId: string,
  dataType: string,
  start: string,
  end: string,
): Promise<any> {
  return authedGet(userId, `/users/me/dataTypes/${encodeURIComponent(dataType)}/daily`, {
    startDate: start,
    endDate: end,
  });
}

// High-resolution intraday samples for a data type on a given day.
export function listIntraday(
  userId: string,
  dataType: string,
  date: string,
): Promise<any> {
  return authedGet(userId, `/users/me/dataTypes/${encodeURIComponent(dataType)}/intraday`, {
    date,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

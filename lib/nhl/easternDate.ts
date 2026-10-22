// NHL schedules are published in Eastern time, so "today"/"tomorrow" has to
// be computed against the Eastern calendar date, not whatever TZ the server
// happens to run in. Shared by every source that offers a "tomorrow" view
// (starting goalies, games) so they agree on what date that means.
export const NHL_TIME_ZONE = "America/New_York";

function easternDateString(date: Date): string {
  // en-CA formats as YYYY-MM-DD, which also matches the date-page URL format
  // both dailyfaceoff.com and the NHL API use (e.g. /starting-goalies/2026-10-22,
  // /v1/score/2026-10-22).
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NHL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTodayEasternDate(): string {
  return easternDateString(new Date());
}

export function getTomorrowEasternDate(): string {
  const [y, m, d] = easternDateString(new Date()).split("-").map(Number);
  // Pure calendar arithmetic on the already-Eastern Y/M/D — Date.UTC
  // normalizes day overflow (e.g. day 32 rolls into the next month) without
  // needing a second timezone conversion.
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1));
  return [
    tomorrow.getUTCFullYear(),
    String(tomorrow.getUTCMonth() + 1).padStart(2, "0"),
    String(tomorrow.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

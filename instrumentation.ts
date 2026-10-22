const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export async function register() {
  // Only run the background scheduler in the long-running Node server, never
  // in the edge runtime (and never twice, if this module gets re-evaluated).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as unknown as { __sportshubSchedulerStarted?: boolean };
  if (g.__sportshubSchedulerStarted) return;
  g.__sportshubSchedulerStarted = true;

  const { refreshNhlData } = await import("./lib/nhl/store");

  await refreshNhlData();
  setInterval(() => {
    void refreshNhlData();
  }, FOUR_HOURS_MS);
}

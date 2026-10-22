"use client";

import { useState, useTransition } from "react";
import type { StartingGoalieMatchup } from "@/lib/nhl/types";
import { GoalieMatchupCard } from "./GoalieCard";

type Tab = "today" | "tomorrow";

type TomorrowState =
  | { status: "idle" }
  | { status: "loaded"; matchups: StartingGoalieMatchup[]; sourceAvailable: boolean }
  | { status: "error" };

export function GoaliesTabs({
  todayMatchups,
  todaySourceAvailable,
  logos,
  fetchTomorrow,
}: {
  todayMatchups: StartingGoalieMatchup[];
  todaySourceAvailable: boolean;
  logos: Map<string, string>;
  // A server action passed down from the page — keeps this component free of
  // its own "use server" import and of knowing anything about auth.
  fetchTomorrow: () => Promise<{
    matchups: StartingGoalieMatchup[];
    sourceAvailable: boolean;
  }>;
}) {
  const [tab, setTab] = useState<Tab>("today");
  const [tomorrow, setTomorrow] = useState<TomorrowState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function selectTomorrow() {
    setTab("tomorrow");
    // Only fetch the first time this is clicked — the result stays cached
    // both here (for the rest of this page view) and server-side (for every
    // other view until the calendar date rolls over), so flipping back and
    // forth between tabs never re-fetches.
    if (tomorrow.status === "idle") {
      startTransition(async () => {
        try {
          const result = await fetchTomorrow();
          setTomorrow({ status: "loaded", ...result });
        } catch {
          setTomorrow({ status: "error" });
        }
      });
    }
  }

  const sourceUrl =
    tab === "tomorrow" && tomorrow.status === "loaded"
      ? `https://www.dailyfaceoff.com/starting-goalies/${tomorrow.matchups[0]?.gameDate ?? ""}`
      : "https://www.dailyfaceoff.com/starting-goalies";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              tab === "today"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={selectTomorrow}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              tab === "tomorrow"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            Tomorrow
          </button>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          Source: dailyfaceoff.com ↗
        </a>
      </div>

      {tab === "today" && (
        <GoalieList
          matchups={todayMatchups}
          sourceAvailable={todaySourceAvailable}
          logos={logos}
          emptyMessage="No confirmed starters yet."
        />
      )}

      {tab === "tomorrow" && (
        <>
          {isPending && tomorrow.status === "idle" && (
            <p className="text-sm text-muted">Loading tomorrow&apos;s starters…</p>
          )}
          {tomorrow.status === "error" && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              Starting goalies source (dailyfaceoff.com) was unavailable.
            </p>
          )}
          {tomorrow.status === "loaded" && (
            <GoalieList
              matchups={tomorrow.matchups}
              sourceAvailable={tomorrow.sourceAvailable}
              logos={logos}
              emptyMessage="No games scheduled tomorrow."
            />
          )}
        </>
      )}
    </div>
  );
}

function GoalieList({
  matchups,
  sourceAvailable,
  logos,
  emptyMessage,
}: {
  matchups: StartingGoalieMatchup[];
  sourceAvailable: boolean;
  logos: Map<string, string>;
  emptyMessage: string;
}) {
  return (
    <>
      {!sourceAvailable && (
        <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          Starting goalies source (dailyfaceoff.com) was unavailable on the
          last refresh.
        </p>
      )}
      {matchups.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matchups.map((matchup) => (
            <GoalieMatchupCard
              key={`${matchup.gameDate}-${matchup.awayGoalie.teamAbbrev}-${matchup.homeGoalie.teamAbbrev}`}
              matchup={matchup}
              logos={logos}
            />
          ))}
        </ul>
      )}
    </>
  );
}

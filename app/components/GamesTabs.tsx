"use client";

import { useState, useTransition } from "react";
import type { GameSummary } from "@/lib/nhl/types";
import { NHL_TIME_ZONE } from "@/lib/nhl/easternDate";
import { GameCard } from "./GameCard";

function easternDateOf(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NHL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoDateTime));
}

type Tab = "today" | "tomorrow";

type TomorrowState =
  | { status: "idle" }
  | { status: "loaded"; games: GameSummary[]; sourceAvailable: boolean }
  | { status: "error" };

export function GamesTabs({
  todayGames,
  logos,
  fetchTomorrow,
}: {
  todayGames: GameSummary[];
  logos: Map<string, string>;
  // A server action passed down from the page — keeps this component free of
  // its own "use server" import and of knowing anything about auth.
  fetchTomorrow: () => Promise<{
    games: GameSummary[];
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
    tab === "tomorrow" && tomorrow.status === "loaded" && tomorrow.games[0]
      ? `https://www.nhl.com/schedule/${easternDateOf(tomorrow.games[0].startTimeUTC)}`
      : "https://www.nhl.com/schedule";

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
          Source: nhl.com ↗
        </a>
      </div>

      {tab === "today" && (
        <GameList
          games={todayGames}
          sourceAvailable
          logos={logos}
          emptyMessage="No games today."
        />
      )}

      {tab === "tomorrow" && (
        <>
          {isPending && tomorrow.status === "idle" && (
            <p className="text-sm text-muted">Loading tomorrow&apos;s games…</p>
          )}
          {tomorrow.status === "error" && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              NHL schedule data was unavailable.
            </p>
          )}
          {tomorrow.status === "loaded" && (
            <GameList
              games={tomorrow.games}
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

function GameList({
  games,
  sourceAvailable,
  logos,
  emptyMessage,
}: {
  games: GameSummary[];
  sourceAvailable: boolean;
  logos: Map<string, string>;
  emptyMessage: string;
}) {
  return (
    <>
      {!sourceAvailable && (
        <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          NHL schedule data was unavailable on the last refresh.
        </p>
      )}
      {games.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} logos={logos} />
          ))}
        </ul>
      )}
    </>
  );
}

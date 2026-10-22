"use client";

import { useState, useTransition } from "react";
import type { RegressionPick } from "@/lib/nhl/picks";
import { RegressionPickCard } from "./PickCard";

type Tab = "today" | "tomorrow";

type TomorrowState =
  | { status: "idle" }
  | { status: "loaded"; items: RegressionPick[]; sourceAvailable: boolean }
  | { status: "error" };

// Today/Tomorrow toggle for a regression-based picks list (overs or unders —
// same shape either way, just different data and messaging passed in).
// Deliberately not generic over a render-prop: a function created in the
// parent Server Component can't cross into a Client Component as a prop
// (only data and Server Actions can), so this renders RegressionPickCard
// directly rather than accepting one from the caller.
export function RegressionPicksTabs({
  todayItems,
  todaySourceAvailable,
  logos,
  fetchTomorrow,
  emptyMessage,
  unavailableMessage,
}: {
  todayItems: RegressionPick[];
  todaySourceAvailable: boolean;
  logos: Map<string, string>;
  fetchTomorrow: () => Promise<{
    items: RegressionPick[];
    sourceAvailable: boolean;
  }>;
  emptyMessage: string;
  unavailableMessage: string;
}) {
  const [tab, setTab] = useState<Tab>("today");
  const [tomorrow, setTomorrow] = useState<TomorrowState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function selectTomorrow() {
    setTab("tomorrow");
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

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 rounded-full border border-line bg-surface p-1 text-sm">
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

      {tab === "today" && (
        <PickList
          items={todayItems}
          sourceAvailable={todaySourceAvailable}
          logos={logos}
          emptyMessage={emptyMessage}
          unavailableMessage={unavailableMessage}
        />
      )}

      {tab === "tomorrow" && (
        <>
          {isPending && tomorrow.status === "idle" && (
            <p className="text-sm text-muted">Loading tomorrow&apos;s picks…</p>
          )}
          {tomorrow.status === "error" && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              {unavailableMessage}
            </p>
          )}
          {tomorrow.status === "loaded" && (
            <PickList
              items={tomorrow.items}
              sourceAvailable={tomorrow.sourceAvailable}
              logos={logos}
              emptyMessage={emptyMessage}
              unavailableMessage={unavailableMessage}
            />
          )}
        </>
      )}
    </div>
  );
}

function PickList({
  items,
  sourceAvailable,
  logos,
  emptyMessage,
  unavailableMessage,
}: {
  items: RegressionPick[];
  sourceAvailable: boolean;
  logos: Map<string, string>;
  emptyMessage: string;
  unavailableMessage: string;
}) {
  return (
    <>
      {!sourceAvailable && (
        <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          {unavailableMessage}
        </p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pick) => (
            <RegressionPickCard key={pick.game.id} pick={pick} logos={logos} />
          ))}
        </ul>
      )}
    </>
  );
}

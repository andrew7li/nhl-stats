"use client";

import { useState, useTransition } from "react";
import type { FatiguePick } from "@/lib/nhl/picks";
import { FatiguePickCard } from "./PickCard";

type Tab = "today" | "tomorrow";

type TomorrowState =
  | { status: "idle" }
  | { status: "loaded"; items: FatiguePick[]; sourceAvailable: boolean }
  | { status: "error" };

export function FatiguePicksTabs({
  todayItems,
  todaySourceAvailable,
  logos,
  fetchTomorrow,
}: {
  todayItems: FatiguePick[];
  todaySourceAvailable: boolean;
  logos: Map<string, string>;
  fetchTomorrow: () => Promise<{
    items: FatiguePick[];
    sourceAvailable: boolean;
  }>;
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
        />
      )}

      {tab === "tomorrow" && (
        <>
          {isPending && tomorrow.status === "idle" && (
            <p className="text-sm text-muted">Loading tomorrow&apos;s picks…</p>
          )}
          {tomorrow.status === "error" && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              NHL schedule data was unavailable.
            </p>
          )}
          {tomorrow.status === "loaded" && (
            <PickList
              items={tomorrow.items}
              sourceAvailable={tomorrow.sourceAvailable}
              logos={logos}
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
}: {
  items: FatiguePick[];
  sourceAvailable: boolean;
  logos: Map<string, string>;
}) {
  return (
    <>
      {!sourceAvailable && (
        <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          NHL schedule data was unavailable on the last refresh.
        </p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted">No rest-edge games.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pick) => (
            <FatiguePickCard key={pick.game.id} pick={pick} logos={logos} />
          ))}
        </ul>
      )}
    </>
  );
}

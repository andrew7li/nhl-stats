import Link from "next/link";
import type { Sport } from "@/lib/sports";

export function ComingSoon({ sport }: { sport: Sport }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6">
      <SportHeading sport={sport} />
      <div className="mt-10 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
        <span className="mb-4 rounded-full bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
          Coming soon
        </span>
        <h2 className="mb-2 text-xl font-semibold">
          {sport.name} stats are on the way
        </h2>
        <p className="mb-6 max-w-md text-sm text-muted">
          Standings, scores and projections for the {sport.league} will land
          here once its data sources are wired up.
        </p>
        <Link
          href="/nhl"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Browse NHL instead
        </Link>
      </div>
    </main>
  );
}

export function SportHeading({ sport }: { sport: Sport }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${sport.accent}`}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{sport.name}</h1>
        <p className="text-sm text-muted">{sport.league}</p>
      </div>
    </div>
  );
}

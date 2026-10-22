import Link from "next/link";
import { SPORTS } from "@/lib/sports";

export default function HubPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-24">
      <section className="mb-14 max-w-2xl">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Every league. One scoreboard.
        </h1>
        <p className="text-lg text-muted">
          SportsHub pulls standings, scores and playoff projections from
          multiple public sources into a single, fast view.
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-3">
        {SPORTS.map((sport) => (
          <li key={sport.slug}>
            <Link
              href={`/${sport.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line p-6 transition-colors hover:bg-surface-hover"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${sport.accent}`}
              />
              <div className="mb-8 flex items-center justify-between">
                <span className="text-2xl font-semibold">{sport.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    sport.available
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-surface text-muted"
                  }`}
                >
                  {sport.available ? "Live" : "Coming soon"}
                </span>
              </div>
              <p className="mt-auto text-sm text-muted">{sport.league}</p>
              <span className="mt-2 text-sm font-medium transition-transform group-hover:translate-x-1">
                {sport.available ? "View stats →" : "Preview →"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

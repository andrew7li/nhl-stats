import type { GameSummary } from "@/lib/nhl/types";
import { NHL_TIME_ZONE } from "@/lib/nhl/easternDate";
import { TeamLogo } from "./TeamLogo";

export function GameCard({
  game,
  logos,
}: {
  game: GameSummary;
  logos: Map<string, string>;
}) {
  const status = gameStatus(game);
  const started = status.kind !== "upcoming";
  const awayWins = started && game.awayTeam.score > game.homeTeam.score;
  const homeWins = started && game.homeTeam.score > game.awayTeam.score;

  return (
    <li className="rounded-xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span
          className={
            status.kind === "live"
              ? "flex items-center gap-1.5 font-semibold text-red-500"
              : "font-medium text-muted"
          }
        >
          {status.kind === "live" && (
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
          )}
          {status.label}
        </span>
      </div>
      {[
        { team: game.awayTeam, leading: awayWins },
        { team: game.homeTeam, leading: homeWins },
      ].map(({ team, leading }) => (
        <div
          key={team.abbrev}
          className="flex items-center justify-between py-1"
        >
          <span className="flex items-center gap-2.5">
            <TeamLogo src={logos.get(team.abbrev)} abbrev={team.abbrev} />
            <span
              className={started && !leading ? "text-muted" : "font-medium"}
            >
              {team.name}
            </span>
          </span>
          {started && (
            <span
              className={`font-mono text-lg tabular-nums ${
                leading ? "font-semibold" : "text-muted"
              }`}
            >
              {team.score}
            </span>
          )}
        </div>
      ))}
    </li>
  );
}

function gameStatus(game: GameSummary): {
  kind: "upcoming" | "live" | "final";
  label: string;
} {
  switch (game.gameState) {
    case "LIVE":
    case "CRIT":
      return { kind: "live", label: "Live" };
    case "FINAL":
    case "OFF":
      return { kind: "final", label: "Final" };
    default:
      return {
        kind: "upcoming",
        label: `${new Date(game.startTimeUTC).toLocaleTimeString("en-US", {
          timeZone: NHL_TIME_ZONE,
          hour: "numeric",
          minute: "2-digit",
        })} ET`,
      };
  }
}

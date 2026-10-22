import type { StartingGoalie, StartingGoalieMatchup } from "@/lib/nhl/types";
import { TeamLogo } from "./TeamLogo";

export function GoalieMatchupCard({
  matchup,
  logos,
}: {
  matchup: StartingGoalieMatchup;
  logos: Map<string, string>;
}) {
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex flex-col gap-3">
        <GoaliePanel
          goalie={matchup.awayGoalie}
          logo={logos.get(matchup.awayGoalie.teamAbbrev)}
        />
        <div className="border-t border-line" />
        <GoaliePanel
          goalie={matchup.homeGoalie}
          logo={logos.get(matchup.homeGoalie.teamAbbrev)}
        />
      </div>
    </li>
  );
}

function GoaliePanel({
  goalie,
  logo,
}: {
  goalie: StartingGoalie;
  logo?: string;
}) {
  const confirmed = goalie.confirmation.toLowerCase() === "confirmed";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <TeamLogo src={logo} abbrev={goalie.teamAbbrev} />
        <div>
          <p className="text-sm font-medium">{goalie.goalieName}</p>
          <p className="text-xs text-muted">
            {goalie.wins}-{goalie.losses}-{goalie.overtimeLosses}
            {goalie.savePercentage != null && (
              <> · {goalie.savePercentage.toFixed(3)} SV%</>
            )}
            {goalie.goalsAgainstAverage != null && (
              <> · {goalie.goalsAgainstAverage.toFixed(2)} GAA</>
            )}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          confirmed
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        }`}
      >
        {goalie.confirmation}
      </span>
    </div>
  );
}

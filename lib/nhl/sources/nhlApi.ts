import type { GameSummary, RecentGame, TeamStanding } from "../types";
import { USER_AGENT } from "./userAgent";

type NhlStandingsResponse = {
  standings: Array<{
    teamAbbrev: { default: string };
    teamName: { default: string };
    teamLogo: string;
    divisionName: string;
    conferenceName: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    otLosses: number;
    points: number;
    goalFor: number;
    goalAgainst: number;
    leagueSequence: number;
  }>;
};

type NhlScoreResponse = {
  games: Array<{
    id: number;
    gameState: string;
    startTimeUTC: string;
    awayTeam: { abbrev: string; name: { default: string }; score?: number };
    homeTeam: { abbrev: string; name: { default: string }; score?: number };
  }>;
};

type NhlClubScheduleResponse = {
  games: Array<{
    id: number;
    gameType: number;
    gameDate: string;
    gameState: string;
    awayTeam: { abbrev: string; score?: number };
    homeTeam: { abbrev: string; score?: number };
    gameOutcome?: { lastPeriodType: string };
  }>;
};

// gameType 2 is the regular season; preseason (1) and playoff (3) games
// would skew the comparison against the season scoring average.
const REGULAR_SEASON = 2;
const COMPLETED_STATES = new Set(["OFF", "FINAL"]);

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchStandings(): Promise<TeamStanding[]> {
  const data = await fetchJson<NhlStandingsResponse>(
    "https://api-web.nhle.com/v1/standings/now",
  );

  return data.standings
    .map((team) => ({
      teamAbbrev: team.teamAbbrev.default,
      fullName: team.teamName.default,
      divisionName: team.divisionName,
      conferenceName: team.conferenceName,
      gamesPlayed: team.gamesPlayed,
      wins: team.wins,
      losses: team.losses,
      otLosses: team.otLosses,
      points: team.points,
      goalsFor: team.goalFor,
      goalsAgainst: team.goalAgainst,
      leagueSequence: team.leagueSequence,
      logo: team.teamLogo,
    }))
    .sort((a, b) => a.leagueSequence - b.leagueSequence);
}

export async function fetchScores(date?: string): Promise<GameSummary[]> {
  const data = await fetchJson<NhlScoreResponse>(
    `https://api-web.nhle.com/v1/score/${date ?? "now"}`,
  );

  return data.games.map((game) => ({
    id: game.id,
    gameState: game.gameState,
    startTimeUTC: game.startTimeUTC,
    awayTeam: {
      abbrev: game.awayTeam.abbrev,
      name: game.awayTeam.name.default,
      score: game.awayTeam.score ?? 0,
    },
    homeTeam: {
      abbrev: game.homeTeam.abbrev,
      name: game.homeTeam.name.default,
      score: game.homeTeam.score ?? 0,
    },
  }));
}

async function fetchTeamRecentGames(
  teamAbbrev: string,
  count: number,
): Promise<RecentGame[]> {
  const data = await fetchJson<NhlClubScheduleResponse>(
    `https://api-web.nhle.com/v1/club-schedule-season/${teamAbbrev}/now`,
  );

  return data.games
    .filter(
      (game) =>
        game.gameType === REGULAR_SEASON &&
        COMPLETED_STATES.has(game.gameState),
    )
    .slice(-count)
    .reverse()
    .map((game) => {
      const isHome = game.homeTeam.abbrev === teamAbbrev;
      const us = isHome ? game.homeTeam : game.awayTeam;
      const them = isHome ? game.awayTeam : game.homeTeam;
      // Shootout winners are credited one extra goal in the score, the same
      // way the standings' goalFor counts them.
      const goalsFor = us.score ?? 0;
      const goalsAgainst = them.score ?? 0;
      const wentToExtras = game.gameOutcome?.lastPeriodType !== "REG";

      return {
        id: game.id,
        gameDate: game.gameDate,
        opponentAbbrev: them.abbrev,
        isHome,
        goalsFor,
        goalsAgainst,
        result:
          goalsFor > goalsAgainst ? "W" : wentToExtras ? "OTL" : "L",
      };
    });
}

// One schedule request per team (32 total). Individual failures are dropped
// rather than failing the whole batch; only an all-around failure throws.
export async function fetchRecentGames(
  teamAbbrevs: string[],
  count = 5,
): Promise<Map<string, RecentGame[]>> {
  const results = await Promise.allSettled(
    teamAbbrevs.map((abbrev) => fetchTeamRecentGames(abbrev, count)),
  );

  const byTeam = new Map<string, RecentGame[]>();
  results.forEach((result, i) => {
    if (result.status === "fulfilled") byTeam.set(teamAbbrevs[i], result.value);
  });

  if (byTeam.size === 0 && teamAbbrevs.length > 0) {
    throw new Error("All club schedule requests failed");
  }
  return byTeam;
}

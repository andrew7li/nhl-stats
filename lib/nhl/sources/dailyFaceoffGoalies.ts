import type { StartingGoalie, StartingGoalieMatchup } from "../types";
import { USER_AGENT } from "./userAgent";

const BASE_URL = "https://www.dailyfaceoff.com/starting-goalies";

// The page server-renders its data into Next.js's standard __NEXT_DATA__
// script tag (pageProps.data: one entry per game), so there's no HTML-table
// scraping involved — just reading the same JSON the page itself hydrates
// from. robots.txt explicitly allows this path (only /api/ and /cms/ are
// disallowed); it blocks the bare default `curl` UA string specifically, not
// identified automated traffic in general.
const NEXT_DATA_SCRIPT =
  /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;

type RawGoalieGame = {
  date: string;
  homeTeamAbbreviation: string;
  homeTeamName: string;
  homeGoalieName: string;
  homeGoalieHeadshotUrl: string | null;
  homeGoalieWins: number;
  homeGoalieLosses: number;
  homeGoalieOvertimeLosses: number;
  homeGoalieSavePercentage: string | null;
  homeGoalieGoalsAgainstAvg: string | null;
  homeNewsStrengthName: string | null;
  homeNewsDetails: string | null;
  awayTeamAbbreviation: string;
  awayTeamName: string;
  awayGoalieName: string;
  awayGoalieHeadshotUrl: string | null;
  awayGoalieWins: number;
  awayGoalieLosses: number;
  awayGoalieOvertimeLosses: number;
  awayGoalieSavePercentage: string | null;
  awayGoalieGoalsAgainstAvg: string | null;
  awayNewsStrengthName: string | null;
  awayNewsDetails: string | null;
};

function toNumber(value: string | null | undefined): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function homeSide(game: RawGoalieGame): StartingGoalie {
  return {
    teamAbbrev: game.homeTeamAbbreviation,
    teamName: game.homeTeamName,
    goalieName: game.homeGoalieName,
    headshotUrl: game.homeGoalieHeadshotUrl ?? null,
    wins: game.homeGoalieWins,
    losses: game.homeGoalieLosses,
    overtimeLosses: game.homeGoalieOvertimeLosses,
    savePercentage: toNumber(game.homeGoalieSavePercentage),
    goalsAgainstAverage: toNumber(game.homeGoalieGoalsAgainstAvg),
    confirmation: game.homeNewsStrengthName ?? "Unknown",
    newsDetails: game.homeNewsDetails?.trim() || null,
  };
}

function awaySide(game: RawGoalieGame): StartingGoalie {
  return {
    teamAbbrev: game.awayTeamAbbreviation,
    teamName: game.awayTeamName,
    goalieName: game.awayGoalieName,
    headshotUrl: game.awayGoalieHeadshotUrl ?? null,
    wins: game.awayGoalieWins,
    losses: game.awayGoalieLosses,
    overtimeLosses: game.awayGoalieOvertimeLosses,
    savePercentage: toNumber(game.awayGoalieSavePercentage),
    goalsAgainstAverage: toNumber(game.awayGoalieGoalsAgainstAvg),
    confirmation: game.awayNewsStrengthName ?? "Unknown",
    newsDetails: game.awayNewsDetails?.trim() || null,
  };
}

export async function fetchStartingGoalies(
  date?: string,
): Promise<StartingGoalieMatchup[]> {
  const url = date ? `${BASE_URL}/${date}` : BASE_URL;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  const html = await res.text();

  const match = NEXT_DATA_SCRIPT.exec(html);
  if (!match) {
    throw new Error("Could not find __NEXT_DATA__ on dailyfaceoff.com");
  }

  const parsed = JSON.parse(match[1]);
  const games: RawGoalieGame[] = parsed?.props?.pageProps?.data ?? [];

  return games.map((game) => ({
    gameDate: game.date,
    homeGoalie: homeSide(game),
    awayGoalie: awaySide(game),
  }));
}

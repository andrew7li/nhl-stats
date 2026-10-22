import type { PlayoffOdds } from "../types";
import { USER_AGENT } from "./userAgent";

const URL = "https://hockeystats.com/playoff-odds";

// hockeystats.com publishes this page's team data as schema.org SportsTeam
// JSON-LD blocks (CC BY-NC 4.0), intended for structured reuse rather than
// an HTML table we'd have to parse by hand.
const LD_JSON_SCRIPT = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

type SportsTeamLd = {
  "@type": "SportsTeam";
  name: string;
  additionalProperty?: Array<{ name: string; value: number }>;
};

function isSportsTeamLd(value: unknown): value is SportsTeamLd {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { "@type"?: unknown })["@type"] === "SportsTeam"
  );
}

export async function fetchPlayoffOdds(): Promise<Map<string, PlayoffOdds>> {
  const res = await fetch(URL, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Request to ${URL} failed with status ${res.status}`);
  }
  const html = await res.text();

  const oddsByTeamName = new Map<string, PlayoffOdds>();

  for (const match of html.matchAll(LD_JSON_SCRIPT)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }
    if (!isSportsTeamLd(parsed)) continue;

    const props = new Map(
      (parsed.additionalProperty ?? []).map((p) => [p.name, p.value]),
    );

    oddsByTeamName.set(parsed.name, {
      playoffProbability: props.get("Playoff Probability") ?? 0,
      stanleyCupProbability: props.get("Stanley Cup Win Probability") ?? 0,
      projectedPoints: props.get("Projected Points") ?? null,
    });
  }

  return oddsByTeamName;
}

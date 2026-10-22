export type Sport = {
  slug: "nhl" | "nba" | "nfl";
  name: string;
  league: string;
  available: boolean;
  // Tailwind classes for the per-sport accent, kept here so the nav, hub
  // cards and sport pages all agree on one colour per league.
  accent: string;
};

export const SPORTS: Sport[] = [
  {
    slug: "nhl",
    name: "NHL",
    league: "National Hockey League",
    available: true,
    accent: "from-sky-500 to-cyan-400",
  },
  {
    slug: "nba",
    name: "NBA",
    league: "National Basketball Association",
    available: false,
    accent: "from-orange-500 to-amber-400",
  },
  {
    slug: "nfl",
    name: "NFL",
    league: "National Football League",
    available: false,
    accent: "from-emerald-500 to-lime-400",
  },
];

export function getSport(slug: Sport["slug"]): Sport {
  return SPORTS.find((sport) => sport.slug === slug)!;
}

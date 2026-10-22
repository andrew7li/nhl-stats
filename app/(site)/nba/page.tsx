import type { Metadata } from "next";
import { ComingSoon } from "@/app/components/ComingSoon";
import { getSport } from "@/lib/sports";

export const metadata: Metadata = { title: "NBA" };

export default function NbaPage() {
  return <ComingSoon sport={getSport("nba")} />;
}

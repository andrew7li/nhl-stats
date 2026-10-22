import type { Metadata } from "next";
import { ComingSoon } from "@/app/components/ComingSoon";
import { getSport } from "@/lib/sports";

export const metadata: Metadata = { title: "NFL" };

export default function NflPage() {
  return <ComingSoon sport={getSport("nfl")} />;
}

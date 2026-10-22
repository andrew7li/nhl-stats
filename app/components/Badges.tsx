import { FATIGUE_WINDOW_DAYS } from "@/lib/nhl/picks";

export function DeltaBadge({ value }: { value: number }) {
  // ±0.5 GF/G over five games is roughly 2–3 goals off pace — enough to be
  // worth a glance without flagging every bit of noise.
  const cold = value <= -0.5;
  const hot = value >= 0.5;
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-medium ${
        cold
          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
          : hot
            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
            : "text-muted"
      }`}
    >
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {Math.abs(value).toFixed(2)}
    </span>
  );
}

export function FatigueBadge({
  count,
  fatigued,
}: {
  count: number;
  fatigued: boolean;
}) {
  if (!fatigued) return <span className="text-muted">—</span>;
  return (
    <span className="whitespace-nowrap rounded bg-red-500/10 px-1.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
      {count} in {FATIGUE_WINDOW_DAYS}d
    </span>
  );
}

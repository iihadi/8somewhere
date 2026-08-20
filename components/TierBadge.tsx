import { TIERS, type Tier } from "@/lib/tiers";

export default function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const t = TIERS[tier];
  const pad =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "sm"
        ? "px-2.5 py-1 text-[0.65rem]"
        : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border font-medium uppercase tracking-wider ${pad}`}
      style={{
        color: t.accent,
        borderColor: `color-mix(in oklab, ${t.accent} 35%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${t.accent} 12%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: t.accent }}
      />
      {size === "lg" ? t.label : t.short}
    </span>
  );
}

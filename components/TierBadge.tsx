import { TIERS, type Tier } from "@/lib/tiers";
import Stars from "./Stars";

/**
 * Compact pill wrapper around <Stars> for use over photos or in dense
 * lists, where the stars alone wouldn't have enough contrast.
 */
export default function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const t = TIERS[tier];
  const pad =
    size === "lg" ? "px-4 py-2" : size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";

  return (
    <span
      className={`accent-glow inline-flex shrink-0 items-center gap-2 rounded-full border ${pad}`}
      style={{
        borderColor: `color-mix(in oklab, ${t.accent} 35%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${t.accent} 12%, transparent)`,
        ["--glow" as string]: t.accent,
      }}
    >
      <Stars tier={tier} size={size} />
    </span>
  );
}

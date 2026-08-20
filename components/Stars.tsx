import { TIERS, type Tier } from "@/lib/tiers";

function StarIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden>
      <path
        d="M12 2.5l2.86 6.24 6.64.62-5.03 4.5 1.5 6.64L12 16.9l-6 3.6 1.5-6.64-5.03-4.5 6.64-.62L12 2.5z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
        opacity={filled ? 1 : 0.45}
      />
    </svg>
  );
}

/**
 * Michelin-style 0–3 star rating. `tier: "unlogged"` renders "Not yet
 * rated" instead of stars — it isn't a zero, it's an absence.
 */
export default function Stars({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const t = TIERS[tier];
  const px = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";

  if (t.stars === null) {
    return (
      <span className="text-xs uppercase tracking-wider text-muted">
        Not yet rated
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${px}`}
      style={{ color: t.accent }}
      title={`${t.stars} of 3 — ${t.label}`}
    >
      {[0, 1, 2].map((i) => (
        <StarIcon key={i} filled={i < t.stars!} color={t.accent} />
      ))}
    </span>
  );
}

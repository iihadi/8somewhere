export type Tier = "loved" | "liked" | "mixed" | "avoid" | "unlogged";

/**
 * Verdicts display as a 0–3 star scale, Michelin-style, rather than a
 * pill label. `stars: null` (unlogged) is deliberately not the same as
 * 0 — zero is a rated, negative verdict; null means no verdict exists.
 */
export const TIERS: Record<
  Tier,
  {
    label: string;
    stars: number | null;
    blurb: string;
    order: number;
    accent: string;
  }
> = {
  loved: {
    label: "Loved it",
    stars: 3,
    blurb: "Benchmark tier. Would rearrange a weekend around it.",
    order: 0,
    accent: "var(--color-ember)",
  },
  liked: {
    label: "Liked it",
    stars: 2,
    blurb: "Solid. Good meal, not top tier.",
    order: 1,
    accent: "var(--color-gold)",
  },
  mixed: {
    label: "Mixed",
    stars: 1,
    blurb: "Fine. Nothing wrong, nothing worth returning for.",
    order: 2,
    accent: "#8a8a94",
  },
  avoid: {
    label: "Wouldn't go back",
    stars: 0,
    blurb: "Something went wrong, and I've said what.",
    order: 3,
    accent: "#e0554f",
  },
  unlogged: {
    label: "No verdict logged",
    stars: null,
    blurb: "Been, but never wrote anything down about it.",
    order: 4,
    accent: "#5c5c66",
  },
};

export const TIER_ORDER: Tier[] = ["loved", "liked", "mixed", "avoid", "unlogged"];

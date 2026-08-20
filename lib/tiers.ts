export type Tier = "loved" | "liked" | "mixed" | "avoid" | "unlogged";

export const TIERS: Record<
  Tier,
  { label: string; short: string; blurb: string; order: number; accent: string }
> = {
  loved: {
    label: "Loved it",
    short: "Loved",
    blurb: "Benchmark tier. Would rearrange a weekend around it.",
    order: 0,
    accent: "var(--color-ember)",
  },
  liked: {
    label: "Liked it",
    short: "Liked",
    blurb: "Solid. Good meal, not top tier.",
    order: 1,
    accent: "var(--color-gold)",
  },
  mixed: {
    label: "Mixed",
    short: "Mixed",
    blurb: "Fine. Nothing wrong, nothing worth returning for.",
    order: 2,
    accent: "#8a8a94",
  },
  avoid: {
    label: "Wouldn't go back",
    short: "Avoid",
    blurb: "Something went wrong, and I've said what.",
    order: 3,
    accent: "#e0554f",
  },
  unlogged: {
    label: "No verdict logged",
    short: "No verdict",
    blurb: "Been, but never wrote anything down about it.",
    order: 4,
    accent: "#5c5c66",
  },
};

export const TIER_ORDER: Tier[] = ["loved", "liked", "mixed", "avoid", "unlogged"];

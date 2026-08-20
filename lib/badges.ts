/**
 * A badge is the shorthand verdict that the star rating can't carry:
 * three stars says how good the meal was, "One and done" says whether
 * you'd ever bother again. They sit next to the stars, never instead
 * of them, and a review can carry more than one.
 */
export type BadgeKey =
  | "must-visit"
  | "worth-the-trip"
  | "one-and-done"
  | "in-the-rotation"
  | "special-occasion"
  | "hidden-gem"
  | "overrated"
  | "cheap-thrill"
  | "back-already";

export const BADGES: Record<
  BadgeKey,
  { label: string; blurb: string; accent: string; order: number }
> = {
  "must-visit": {
    label: "Must visit",
    blurb: "Go. Book it now and rearrange around it.",
    accent: "var(--color-ember)",
    order: 0,
  },
  "worth-the-trip": {
    label: "Worth the trip",
    blurb: "Justifies the journey on its own.",
    accent: "var(--color-gold)",
    order: 1,
  },
  "in-the-rotation": {
    label: "In the rotation",
    blurb: "A regular. Somewhere I keep going back to.",
    accent: "#7bc47f",
    order: 2,
  },
  "back-already": {
    label: "Back already",
    blurb: "Returned within weeks of the first visit.",
    accent: "#7bc47f",
    order: 3,
  },
  "special-occasion": {
    label: "Special occasion",
    blurb: "Saved for birthdays and good news.",
    accent: "#b28bd8",
    order: 4,
  },
  "hidden-gem": {
    label: "Hidden gem",
    blurb: "Nobody talks about it. They should.",
    accent: "#6bb8d6",
    order: 5,
  },
  "cheap-thrill": {
    label: "Cheap thrill",
    blurb: "Punches far above what it costs.",
    accent: "#7bc47f",
    order: 6,
  },
  "one-and-done": {
    label: "One and done",
    blurb: "Glad I went once. Once was enough.",
    accent: "#8a8a94",
    order: 7,
  },
  overrated: {
    label: "Overrated",
    blurb: "Good, but nowhere near the noise about it.",
    accent: "#e0554f",
    order: 8,
  },
};

export const BADGE_ORDER: BadgeKey[] = (
  Object.keys(BADGES) as BadgeKey[]
).sort((a, b) => BADGES[a].order - BADGES[b].order);

/** Anything not in BADGES is dropped rather than trusted from a payload. */
export function sanitiseBadges(input: unknown): BadgeKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<BadgeKey>();
  for (const v of input) {
    if (typeof v === "string" && v in BADGES) seen.add(v as BadgeKey);
  }
  return BADGE_ORDER.filter((b) => seen.has(b));
}

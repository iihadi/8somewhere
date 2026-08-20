import type { Review } from "@/data/seed-reviews";
import { TIERS, type Tier } from "@/lib/tiers";

/** Undated visits sort to the bottom rather than to 1970. */
function sortKey(r: Review) {
  return r.visitedAt ? +new Date(r.visitedAt) : -Infinity;
}

export function sortByDate(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => sortKey(b) - sortKey(a));
}

export function sortByTier(reviews: Review[]): Review[] {
  return [...reviews].sort(
    (a, b) => TIERS[a.tier].order - TIERS[b.tier].order || sortKey(b) - sortKey(a)
  );
}

export function getCities(reviews: Review[]): string[] {
  return Array.from(new Set(reviews.map((r) => r.city))).sort();
}

export function getTierCounts(reviews: Review[]): Record<Tier, number> {
  return reviews.reduce(
    (acc, r) => {
      acc[r.tier] = (acc[r.tier] ?? 0) + 1;
      return acc;
    },
    {} as Record<Tier, number>
  );
}

export type SiteStats = {
  total: number;
  cities: number;
  countries: number;
  loved: number;
  repeats: number;
  benchmark: Review | null;
  openQuestions: number;
};

/** Falls back gracefully if the benchmark review is ever deleted via /edit. */
export function getStats(reviews: Review[]): SiteStats {
  const cities = getCities(reviews);
  const tierCounts = getTierCounts(reviews);
  return {
    total: reviews.length,
    cities: cities.length,
    countries: new Set(reviews.map((r) => r.country)).size,
    loved: tierCounts.loved ?? 0,
    repeats: reviews.filter((r) => r.revisited).length,
    benchmark:
      reviews.find((r) => r.slug === "row-on-5") ??
      sortByTier(reviews)[0] ??
      null,
    openQuestions: reviews.filter((r) => r.needsCheck).length,
  };
}

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

/* ------------------------------------------------------------------ */
/* Grouping                                                            */
/* ------------------------------------------------------------------ */

export type Group = {
  name: string;
  reviews: Review[];
  /** Best tier present in the group, for sorting/among-the-best display */
  bestTier: Tier;
};

function groupBy(reviews: Review[], key: (r: Review) => string): Group[] {
  const map = new Map<string, Review[]>();
  for (const r of reviews) {
    const k = key(r).trim() || "Unspecified";
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }
  return Array.from(map.entries())
    .map(([name, list]) => ({
      name,
      reviews: sortByTier(list),
      bestTier: sortByTier(list)[0].tier,
    }))
    .sort(
      (a, b) => b.reviews.length - a.reviews.length || a.name.localeCompare(b.name)
    );
}

export function groupByCuisine(reviews: Review[]): Group[] {
  return groupBy(reviews, (r) => r.cuisine);
}

export function groupByCity(reviews: Review[]): Group[] {
  return groupBy(reviews, (r) => r.city);
}

/* ------------------------------------------------------------------ */
/* Stats page data                                                     */
/* ------------------------------------------------------------------ */

export type YearCount = { year: number; count: number };

export function visitsByYear(reviews: Review[]): YearCount[] {
  const map = new Map<number, number>();
  for (const r of reviews) {
    if (!r.visitedAt) continue;
    const year = Number(r.visitedAt.slice(0, 4));
    if (!Number.isFinite(year)) continue;
    map.set(year, (map.get(year) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

export type PriceCount = { price: string; count: number };

export function byPrice(reviews: Review[]): PriceCount[] {
  const order = ["£", "££", "£££", "££££"];
  const map = new Map<string, number>();
  for (const r of reviews) {
    if (!r.price) continue;
    map.set(r.price, (map.get(r.price) ?? 0) + 1);
  }
  return order
    .filter((p) => map.has(p))
    .map((price) => ({ price, count: map.get(price)! }));
}

/**
 * Reviews visited on today's month/day in a previous year. Compares the
 * raw MM-DD from the ISO string rather than going through Date, so the
 * server's timezone can't shift the match by a day.
 */
export function onThisDay(reviews: Review[], today = new Date()): Review[] {
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const needle = `${mm}-${dd}`;
  const thisYear = today.getFullYear();

  return reviews
    .filter((r) => {
      if (!r.visitedAt) return false;
      if (r.visitedAt.slice(5, 10) !== needle) return false;
      return Number(r.visitedAt.slice(0, 4)) !== thisYear;
    })
    .sort((a, b) => sortKey(b) - sortKey(a));
}

/** Reviews that have coordinates and can therefore be mapped. */
export function withLocation(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.lat != null && r.lng != null);
}

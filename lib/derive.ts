import type { Review } from "@/data/seed-reviews";
import { TIERS, type Tier } from "@/lib/tiers";
import { BADGE_ORDER, type BadgeKey } from "@/lib/badges";
import { parseCuisine, UNSPECIFIED } from "@/lib/cuisine";

/* ------------------------------------------------------------------ */
/* Visits                                                              */
/* ------------------------------------------------------------------ */

/**
 * How many times I've eaten somewhere. Entries written before visits
 * were counted only carry the `revisited` flag, which says "at least
 * twice" and nothing more — so it reads as 2.
 */
export function visitCount(r: Review): number {
  if (typeof r.visitCount === "number" && r.visitCount >= 1) {
    return Math.floor(r.visitCount);
  }
  return r.revisited ? 2 : 1;
}

/** Returns after the first, i.e. what "revisited" actually means. */
export function returnCount(r: Review): number {
  return visitCount(r) - 1;
}

export function isRevisit(r: Review): boolean {
  return visitCount(r) > 1;
}

/** "Been back twice" / "Been back once" — null when never revisited. */
export function revisitLabel(r: Review): string | null {
  const back = returnCount(r);
  if (back <= 0) return null;
  if (back === 1) return "Been back once";
  if (back === 2) return "Been back twice";
  return `Been back ${back} times`;
}

/** Undated visits sort to the bottom rather than to 1970. */
function sortKey(r: Review) {
  return r.visitedAt ? +new Date(r.visitedAt) : -Infinity;
}

export function sortByDate(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => sortKey(b) - sortKey(a));
}

export type Neighbors = { prev: Review | null; next: Review | null };

/**
 * Chronological neighbors of `target` within `reviews`, ordered the
 * same way the rest of the site reads the archive: newest-first. So
 * "next" here means "the next one you'd hit scrolling down the
 * archive" (older), and "prev" means newer — matching the reading
 * order everywhere else on the site rather than raw calendar direction.
 */
export function chronologicalNeighbors(reviews: Review[], target: Review): Neighbors {
  const ordered = sortByDate(reviews);
  const idx = ordered.findIndex((r) => r.slug === target.slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: ordered[idx - 1] ?? null,
    next: ordered[idx + 1] ?? null,
  };
}

export function sortByTier(reviews: Review[]): Review[] {
  return [...reviews].sort(
    (a, b) => TIERS[a.tier].order - TIERS[b.tier].order || sortKey(b) - sortKey(a)
  );
}

/**
 * The homepage "Three stars" list's order — a manual curation via
 * drag-and-drop in /edit/featured, not a derived ranking. Reviews with
 * a `featuredRank` sort first, lowest rank first; anything unranked
 * (including tiers other than "loved", which never get one) falls in
 * after, most recently visited first.
 */
export function sortFeatured(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => {
    const ar = a.featuredRank;
    const br = b.featuredRank;
    if (ar != null && br != null) return ar - br;
    if (ar != null) return -1;
    if (br != null) return 1;
    return sortKey(b) - sortKey(a);
  });
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
  /** Meals, not restaurants — a place visited three times counts three. */
  totalVisits: number;
  mostVisited: Review | null;
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
    repeats: reviews.filter(isRevisit).length,
    totalVisits: reviews.reduce((n, r) => n + visitCount(r), 0),
    mostVisited:
      [...reviews]
        .filter(isRevisit)
        .sort((a, b) => visitCount(b) - visitCount(a))[0] ?? null,
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

/**
 * Grouped by kitchen rather than by the exact string that was typed,
 * so "French", "Modern French" and "French tasting menu" are one
 * section. See lib/cuisine.ts.
 */
export function groupByCuisine(reviews: Review[]): Group[] {
  return groupBy(reviews, (r) => parseCuisine(r.cuisine, r.cuisineFamily).family);
}

/**
 * The distinct styles inside one family — "Modern", "Tasting menu" —
 * so a section can show what it actually contains without splitting.
 */
export function stylesInGroup(g: Group): string[] {
  const styles = new Set<string>();
  for (const r of g.reviews) {
    const { style } = parseCuisine(r.cuisine, r.cuisineFamily);
    if (style) styles.add(style);
  }
  return Array.from(styles).sort();
}

/** Every cuisine string already used, for autocomplete in /edit. */
export function getCuisines(reviews: Review[]): string[] {
  return Array.from(
    new Set(reviews.map((r) => r.cuisine.trim()).filter(Boolean))
  ).sort();
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export function getBadgeCounts(reviews: Review[]): Record<BadgeKey, number> {
  const counts = {} as Record<BadgeKey, number>;
  for (const b of BADGE_ORDER) counts[b] = 0;
  for (const r of reviews) {
    for (const b of r.badges ?? []) {
      if (b in counts) counts[b] += 1;
    }
  }
  return counts;
}

/** Badges actually in use, in their canonical display order. */
export function badgesPresent(reviews: Review[]): BadgeKey[] {
  const counts = getBadgeCounts(reviews);
  return BADGE_ORDER.filter((b) => counts[b] > 0);
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

export type TimelineGroup = { year: number; reviews: Review[] };

/**
 * Every dated visit, newest-first, grouped by year — the data behind
 * /timeline. Distinct from visitsByYear above (ascending counts only,
 * feeds the /stats bar chart) and from onThisDay (single calendar-day
 * match for the homepage widget). Undated reviews are excluded rather
 * than sorted to the bottom the way sortByDate does elsewhere — there's
 * nowhere on a timeline to place them; the page surfaces their count
 * separately instead.
 */
export function timelineGroups(reviews: Review[]): TimelineGroup[] {
  const dated = sortByDate(reviews.filter((r) => r.visitedAt));
  const map = new Map<number, Review[]>();
  for (const r of dated) {
    const year = Number(r.visitedAt!.slice(0, 4));
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(r);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearReviews]) => ({ year, reviews: yearReviews }));
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

export type RelatedReview = { review: Review; score: number; reason: string };

/**
 * Other places worth surfacing on a review page beyond "same city" —
 * same kitchen first, then similar price and verdict. Scored rather
 * than filtered so the ordering favours the strongest match, and
 * capped by the caller once it's had a chance to dedupe against
 * whatever else is already shown (e.g. the same-city block).
 */
export function relatedReviews(reviews: Review[], target: Review): RelatedReview[] {
  const targetFamily = parseCuisine(target.cuisine, target.cuisineFamily).family;

  const scored = reviews
    .filter((r) => r.slug !== target.slug)
    .map((r) => {
      let score = 0;
      const reasons: string[] = [];

      const family = parseCuisine(r.cuisine, r.cuisineFamily).family;
      if (family !== UNSPECIFIED && family === targetFamily) {
        score += 3;
        reasons.push(family);
      }
      if (r.tier === target.tier) {
        score += 2;
        reasons.push(TIERS[r.tier].label);
      }
      if (target.price && r.price === target.price) {
        score += 1;
        reasons.push("similar price");
      }
      if (r.city === target.city) {
        score += 1;
      }

      return { review: r, score, reason: reasons[0] ?? "" };
    })
    .filter((r) => r.score > 0);

  return scored.sort(
    (a, b) => b.score - a.score || sortKey(b.review) - sortKey(a.review)
  );
}

/**
 * Everything the public site is allowed to show. Every public page,
 * the sitemap, and the RSS feed must filter through this — /edit is
 * the only place a draft is visible, deliberately.
 */
export function publishedOnly(reviews: Review[]): Review[] {
  return reviews.filter((r) => !r.draft);
}

/** Reviews that have coordinates and can therefore be mapped. */
export function withLocation(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.lat != null && r.lng != null);
}

import "server-only";
import { cache } from "react";
import type { Review, WishlistItem } from "@/data/seed-reviews";
import {
  readReviewsData,
  writeReviewsData,
  readWishlistData,
  writeWishlistData,
} from "./storage";

/**
 * Wrapped in React's `cache` so the store is read once per render
 * rather than once per caller — the site layout, the page and
 * generateMetadata all need the same data on every render.
 *
 * Reads only. Never use this as the read-before-write step in a
 * mutation: `cache()` is scoped to a React render pass, not
 * necessarily to one HTTP request, and on a warm serverless instance
 * handling back-to-back Route Handler calls it can hand back a stale
 * snapshot from an earlier request — silently losing whatever that
 * request just wrote. Mutations must always read fresh; see
 * `readFresh` below.
 */
export const getAllReviews = cache(async (): Promise<Review[]> => {
  return readReviewsData();
});

/** Uncached read, safe to use as the read side of a read-modify-write. */
function readFresh(): Promise<Review[]> {
  return readReviewsData();
}

export async function getReview(slug: string): Promise<Review | undefined> {
  const all = await getAllReviews();
  return all.find((r) => r.slug === slug);
}

export async function createReview(review: Review): Promise<Review> {
  const all = await readFresh();
  if (all.some((r) => r.slug === review.slug)) {
    throw new Error(`A review with slug "${review.slug}" already exists.`);
  }
  await writeReviewsData([review, ...all]);
  return review;
}

export async function updateReview(
  slug: string,
  patch: Omit<Review, "slug">
): Promise<Review> {
  const all = await readFresh();
  const idx = all.findIndex((r) => r.slug === slug);
  if (idx === -1) throw new Error(`No review with slug "${slug}".`);
  const updated: Review = { ...patch, slug };
  all[idx] = updated;
  await writeReviewsData(all);
  return updated;
}

export async function deleteReview(slug: string): Promise<void> {
  const all = await readFresh();
  const next = all.filter((r) => r.slug !== slug);
  if (next.length === all.length) throw new Error(`No review with slug "${slug}".`);
  await writeReviewsData(next);
}

/**
 * Applies one mutation to every review whose slug is in `slugs`, in a
 * single read-modify-write — the dashboard's bulk actions call this
 * instead of one `updateReview` per row, which would both be slower
 * and re-read the whole blob once per row for no reason.
 */
export async function bulkUpdateReviews(
  slugs: string[],
  mutate: (review: Review) => Review
): Promise<number> {
  const wanted = new Set(slugs);
  const all = await readFresh();
  let touched = 0;
  const next = all.map((r) => {
    if (!wanted.has(r.slug)) return r;
    touched += 1;
    return mutate(r);
  });
  if (touched > 0) await writeReviewsData(next);
  return touched;
}

/**
 * Persists a drag-and-drop reorder of the homepage "Three stars" list.
 * `slugs` is the full desired order of every tier: "loved" review;
 * `featuredRank` is written as its index in that array. Anything not
 * loved is left untouched — this never needs to touch it.
 */
export async function reorderFeatured(slugs: string[]): Promise<void> {
  const rank = new Map(slugs.map((slug, i) => [slug, i]));
  const all = await readFresh();
  const next = all.map((r) =>
    rank.has(r.slug) ? { ...r, featuredRank: rank.get(r.slug) } : r
  );
  await writeReviewsData(next);
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                             */
/* ------------------------------------------------------------------ */

export const getWishlist = cache(async (): Promise<WishlistItem[]> => {
  return readWishlistData();
});

export async function createWishlistItem(
  item: Omit<WishlistItem, "id">
): Promise<WishlistItem> {
  const all = await readWishlistData();
  const id = `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const created: WishlistItem = { ...item, id };
  await writeWishlistData([created, ...all]);
  return created;
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const all = await readWishlistData();
  const next = all.filter((w) => w.id !== id);
  if (next.length === all.length) throw new Error(`No wishlist item with id "${id}".`);
  await writeWishlistData(next);
}

export async function updateWishlistItem(
  id: string,
  patch: Partial<Omit<WishlistItem, "id">>
): Promise<WishlistItem> {
  const all = await readWishlistData();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error(`No wishlist item with id "${id}".`);
  const updated: WishlistItem = { ...all[idx], ...patch };
  all[idx] = updated;
  await writeWishlistData(all);
  return updated;
}

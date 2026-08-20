import "server-only";
import { cache } from "react";
import type { Review } from "@/data/seed-reviews";
import { readReviewsData, writeReviewsData } from "./storage";

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

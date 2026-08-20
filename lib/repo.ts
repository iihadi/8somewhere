import "server-only";
import type { Review } from "@/data/seed-reviews";
import { readReviewsData, writeReviewsData } from "./storage";

export async function getAllReviews(): Promise<Review[]> {
  return readReviewsData();
}

export async function getReview(slug: string): Promise<Review | undefined> {
  const all = await getAllReviews();
  return all.find((r) => r.slug === slug);
}

export async function createReview(review: Review): Promise<Review> {
  const all = await getAllReviews();
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
  const all = await getAllReviews();
  const idx = all.findIndex((r) => r.slug === slug);
  if (idx === -1) throw new Error(`No review with slug "${slug}".`);
  const updated: Review = { ...patch, slug };
  all[idx] = updated;
  await writeReviewsData(all);
  return updated;
}

export async function deleteReview(slug: string): Promise<void> {
  const all = await getAllReviews();
  const next = all.filter((r) => r.slug !== slug);
  if (next.length === all.length) throw new Error(`No review with slug "${slug}".`);
  await writeReviewsData(next);
}

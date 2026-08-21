import type { Review } from "@/data/seed-reviews";

export type SearchHit = {
  review: Review;
  /** Which field matched, so the result can show why it's here. */
  field: "name" | "city" | "cuisine" | "verdict" | "quote" | "body" | "dish" | "tag";
  /** The matched text, trimmed to a snippet when it's a long field. */
  snippet: string;
};

const SNIPPET_RADIUS = 60;

function snippetAround(text: string, index: number, len: number): string {
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + len + SNIPPET_RADIUS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/**
 * Searches every review for the first field that matches, in priority
 * order — name first (it's what people actually search for), then the
 * more free-text fields. One hit per review, not one per field, so a
 * restaurant that matches five ways doesn't crowd out the rest.
 */
export function searchReviews(reviews: Review[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: SearchHit[] = [];

  for (const review of reviews) {
    const nameIdx = review.name.toLowerCase().indexOf(q);
    if (nameIdx !== -1) {
      hits.push({ review, field: "name", snippet: review.name });
      continue;
    }

    const cityIdx = review.city.toLowerCase().indexOf(q);
    if (cityIdx !== -1) {
      hits.push({ review, field: "city", snippet: review.city });
      continue;
    }

    const cuisineIdx = review.cuisine.toLowerCase().indexOf(q);
    if (cuisineIdx !== -1) {
      hits.push({ review, field: "cuisine", snippet: review.cuisine });
      continue;
    }

    const tag = review.tags.find((t) => t.toLowerCase().includes(q));
    if (tag) {
      hits.push({ review, field: "tag", snippet: tag });
      continue;
    }

    const dish = review.dishes.find(
      (d) => d.name.toLowerCase().includes(q) || d.note.toLowerCase().includes(q)
    );
    if (dish) {
      hits.push({ review, field: "dish", snippet: dish.name });
      continue;
    }

    const verdictIdx = review.verdict.toLowerCase().indexOf(q);
    if (verdictIdx !== -1) {
      hits.push({
        review,
        field: "verdict",
        snippet: snippetAround(review.verdict, verdictIdx, q.length),
      });
      continue;
    }

    if (review.quote) {
      const quoteIdx = review.quote.toLowerCase().indexOf(q);
      if (quoteIdx !== -1) {
        hits.push({
          review,
          field: "quote",
          snippet: snippetAround(review.quote, quoteIdx, q.length),
        });
        continue;
      }
    }

    const paragraph = review.body.find((p) => p.toLowerCase().includes(q));
    if (paragraph) {
      const idx = paragraph.toLowerCase().indexOf(q);
      hits.push({ review, field: "body", snippet: snippetAround(paragraph, idx, q.length) });
    }
  }

  return hits;
}

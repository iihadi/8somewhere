import { getAllReviews } from "@/lib/repo";
import { getCities, getCuisines } from "@/lib/derive";
import ReviewForm from "@/components/edit/ReviewForm";

export const dynamic = "force-dynamic";

/** Every tag already in use, most-used first, for the tag picker. */
function getTags(reviews: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  for (const r of reviews) {
    for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

export default async function NewReviewPage() {
  const reviews = await getAllReviews();

  return (
    <div>
      <p className="eyebrow">New</p>
      <h1 className="mt-2 font-display text-4xl">Add a restaurant</h1>
      <div className="mt-8">
        <ReviewForm
          mode="create"
          cuisineSuggestions={getCuisines(reviews)}
          citySuggestions={getCities(reviews)}
          tagSuggestions={getTags(reviews)}
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllReviews } from "@/lib/repo";
import { getCities, getCuisines } from "@/lib/derive";
import { storageMode } from "@/lib/storage";
import ReviewForm from "@/components/edit/ReviewForm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

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

export default async function EditReviewPage({ params }: Params) {
  const { slug } = await params;
  const reviews = await getAllReviews();
  const review = reviews.find((r) => r.slug === slug);
  if (!review) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">Editing</p>
          <h1 className="mt-2 font-display text-4xl">{review.name}</h1>
        </div>
        <Link
          href={`/reviews/${review.slug}`}
          target="_blank"
          className="text-sm text-muted transition-colors hover:text-cream"
        >
          View on the site ↗
        </Link>
      </div>
      <div className="mt-8">
        <ReviewForm
          mode="edit"
          initial={review}
          cuisineSuggestions={getCuisines(reviews)}
          existingReviews={reviews.map((r) => ({ slug: r.slug, name: r.name, city: r.city }))}
          citySuggestions={getCities(reviews)}
          tagSuggestions={getTags(reviews)}
          storageMode={storageMode()}
        />
      </div>
    </div>
  );
}

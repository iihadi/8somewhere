import { getAllReviews } from "@/lib/repo";
import { sortFeatured } from "@/lib/derive";
import FeaturedReorder from "@/components/edit/FeaturedReorder";

export const dynamic = "force-dynamic";

export default async function EditFeaturedPage() {
  const reviews = await getAllReviews();
  const loved = sortFeatured(reviews.filter((r) => r.tier === "loved"));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">★ ★ ★</p>
        <h1 className="mt-2 font-display text-4xl">Reorder three stars</h1>
        <p className="mt-2 text-muted">
          Sets the order of the homepage&rsquo;s &ldquo;Three stars&rdquo;
          list — curated by hand rather than sorted automatically.
        </p>
      </div>
      <FeaturedReorder reviews={loved} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getReview } from "@/lib/repo";
import ReviewForm from "@/components/edit/ReviewForm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export default async function EditReviewPage({ params }: Params) {
  const { slug } = await params;
  const review = await getReview(slug);
  if (!review) notFound();

  return (
    <div>
      <p className="eyebrow">Editing</p>
      <h1 className="mt-2 font-display text-4xl">{review.name}</h1>
      <div className="mt-8">
        <ReviewForm mode="edit" initial={review} />
      </div>
    </div>
  );
}

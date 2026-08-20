import ReviewForm from "@/components/edit/ReviewForm";

export default function NewReviewPage() {
  return (
    <div>
      <p className="eyebrow">New</p>
      <h1 className="mt-2 font-display text-4xl">Add a restaurant</h1>
      <div className="mt-8">
        <ReviewForm mode="create" />
      </div>
    </div>
  );
}

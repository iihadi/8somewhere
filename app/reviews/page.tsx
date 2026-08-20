import type { Metadata } from "next";
import { reviewsByDate } from "@/data/reviews";
import ReviewGrid from "@/components/ReviewGrid";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Every restaurant, filtered by city and by verdict.",
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Every meal</h1>
        <p className="mt-4 max-w-xl text-muted">
          Filter by city or by verdict, search by cuisine or trip. Dates
          come off the original booking where there was one.
        </p>
      </Reveal>

      <ReviewGrid reviews={reviewsByDate} />
    </div>
  );
}

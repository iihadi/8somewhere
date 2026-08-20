import type { Metadata } from "next";
import { reviewsByDate } from "@/data/reviews";
import ReviewGrid from "@/components/ReviewGrid";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Every restaurant, sorted, filtered and rated out of ten.",
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Every meal</h1>
        <p className="mt-4 max-w-xl text-muted">
          Filter by city, search by cuisine or trip, sort by whatever you
          feel like. Dates come straight off the booking.
        </p>
      </Reveal>

      <ReviewGrid reviews={reviewsByDate} />
    </div>
  );
}

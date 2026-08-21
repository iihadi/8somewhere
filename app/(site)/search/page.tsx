import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllReviews } from "@/lib/repo";
import { publishedOnly } from "@/lib/derive";
import SearchClient from "@/components/SearchClient";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every review by name, verdict, dish, quote or tag.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const reviews = publishedOnly(await getAllReviews());

  return (
    <div className="mx-auto max-w-3xl px-6 pt-20">
      <Reveal className="mb-10">
        <p className="eyebrow">Find something</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Search</h1>
        <p className="mt-4 max-w-xl text-muted">
          Across names, verdicts, quotes, write-ups, dishes and tags — not
          just what the city and rating filters can see.
        </p>
      </Reveal>

      <Suspense fallback={null}>
        <SearchClient reviews={reviews} />
      </Suspense>
    </div>
  );
}

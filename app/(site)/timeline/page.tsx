import type { Metadata } from "next";
import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { publishedOnly, timelineGroups } from "@/lib/derive";
import Reveal from "@/components/Reveal";
import Timeline from "@/components/Timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Every visit, in the order it actually happened.",
};

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const reviews = publishedOnly(await getAllReviews());
  const groups = timelineGroups(reviews);
  const undatedCount = reviews.filter((r) => !r.visitedAt).length;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24">
      <Reveal className="mb-14">
        <p className="eyebrow">In order</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Timeline</h1>
        <p className="mt-4 max-w-xl text-muted">
          Every dated visit, scrolling back through the years.
          {undatedCount > 0 && (
            <>
              {" "}
              {undatedCount} {undatedCount === 1 ? "visit isn't" : "visits aren't"}{" "}
              dated, so they don&rsquo;t appear here — see the{" "}
              <Link
                href="/reviews"
                className="text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
              >
                full archive
              </Link>
              .
            </>
          )}
        </p>
      </Reveal>

      {groups.length > 0 ? (
        <Timeline groups={groups} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="font-display text-2xl">Nothing dated yet</p>
          <p className="mt-2 text-sm text-muted">
            Add a visit date to a review to see it here.
          </p>
        </div>
      )}
    </div>
  );
}

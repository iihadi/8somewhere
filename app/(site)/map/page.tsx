import type { Metadata } from "next";
import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { publishedOnly, withLocation } from "@/lib/derive";
import MapView from "@/components/MapView";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Map",
  description: "Every restaurant with a pinned location, on one map.",
};

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const all = publishedOnly(await getAllReviews());
  const pinned = withLocation(all);
  const unpinned = all.length - pinned.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-20">
      <Reveal className="mb-8">
        <p className="eyebrow">Everywhere</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Map</h1>
        <p className="mt-4 max-w-xl text-muted">
          {pinned.length} of {all.length} restaurants have a pinned location.
          The number in each pin is its star rating.
          {unpinned > 0 && (
            <>
              {" "}
              The other {unpinned}{" "}
              {unpinned === 1 ? "hasn't" : "haven't"} been pinned yet —
              add one from{" "}
              <Link
                href="/edit"
                className="text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
              >
                the edit page
              </Link>
              .
            </>
          )}
        </p>
      </Reveal>

      {pinned.length > 0 ? (
        <MapView reviews={pinned} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line py-24 text-center">
          <p className="font-display text-2xl">Nothing pinned yet</p>
          <p className="mt-2 text-sm text-muted">
            Open any review in{" "}
            <Link
              href="/edit"
              className="text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
            >
              /edit
            </Link>{" "}
            and use the map lookup to add coordinates.
          </p>
        </div>
      )}
    </div>
  );
}

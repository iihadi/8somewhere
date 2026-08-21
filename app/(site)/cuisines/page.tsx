import type { Metadata } from "next";
import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { groupByCuisine, publishedOnly, stylesInGroup } from "@/lib/derive";
import { formatShortDate } from "@/lib/format";
import { parseCuisine } from "@/lib/cuisine";
import Stars from "@/components/Stars";
import Badges from "@/components/Badges";
import ClosedBadge from "@/components/ClosedBadge";
import StylePill from "@/components/StylePill";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Cuisines",
  description: "Every restaurant grouped by what it actually cooks.",
};

export const dynamic = "force-dynamic";

export default async function CuisinesPage() {
  const reviews = publishedOnly(await getAllReviews());
  const groups = groupByCuisine(reviews);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">By kitchen</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Cuisines</h1>
        <p className="mt-4 max-w-xl text-muted">
          {groups.length} kinds of cooking across {reviews.length}{" "}
          restaurants, most-visited first. Kitchens are grouped by what
          they cook, not by how the entry was typed — &ldquo;French
          tasting menu&rdquo; and &ldquo;Modern French&rdquo; both live
          under French.
        </p>
      </Reveal>

      <div className="space-y-10">
        {groups.map((g, gi) => (
          <Reveal key={g.name} delay={Math.min(gi * 0.03, 0.3)}>
            <section id={encodeURIComponent(g.name)} className="scroll-mt-24">
              <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-line pb-2">
                <h2 className="font-display text-2xl">{g.name}</h2>
                <span className="shrink-0 text-sm text-muted">
                  {g.reviews.length}{" "}
                  {g.reviews.length === 1 ? "place" : "places"}
                </span>
              </div>

              {/* The styles folded into this family, so the grouping is
                  visible rather than something the page did silently. */}
              {stylesInGroup(g).length > 0 && (
                <p className="mb-3 flex flex-wrap gap-1.5">
                  {stylesInGroup(g).map((style) => (
                    <span
                      key={style}
                      className="rounded-full border border-line px-2.5 py-0.5 text-[0.7rem] text-muted"
                    >
                      {style}
                    </span>
                  ))}
                </p>
              )}

              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {g.reviews.map((r) => {
                  const style = parseCuisine(r.cuisine, r.cuisineFamily).style;
                  return (
                    <li key={r.slug}>
                      <Link
                        href={`/reviews/${r.slug}`}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-surface-2"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-display text-lg">
                              {r.name}
                            </span>
                            {style && <StylePill>{style}</StylePill>}
                            {r.closed && <ClosedBadge size="sm" />}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {r.city}
                            {r.visitedAt && ` · ${formatShortDate(r.visitedAt)}`}
                          </span>
                        </span>
                        <Badges badges={r.badges} size="sm" limit={1} />
                        <Stars tier={r.tier} size="sm" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          Nothing logged yet.
        </p>
      )}
    </div>
  );
}

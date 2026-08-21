import type { Metadata } from "next";
import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { getCities, getStats, getTierCounts, publishedOnly } from "@/lib/derive";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import Reveal from "@/components/Reveal";
import TierBadge from "@/components/TierBadge";

export const metadata: Metadata = {
  title: "About",
  description: "What this site is and how the verdicts work.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const reviews = publishedOnly(await getAllReviews());
  const stats = getStats(reviews);
  const cities = getCities(reviews);
  const tierCounts = getTierCounts(reviews);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal className="space-y-6">
        <p className="eyebrow">About</p>
        <h1 className="font-display text-5xl sm:text-6xl">Why this exists</h1>

        <p className="text-xl leading-[1.8]">
          I kept forgetting what I ate and where. This is the fix — every
          restaurant worth logging, with the verdict I actually gave it at
          the time rather than a score invented afterwards.
        </p>

        <p className="leading-[1.85] text-cream/80">
          {stats.total} places across {cities.join(", ")}.
          {stats.benchmark && (
            <>
              {" "}
              The whole thing is graded against{" "}
              <Link
                href={`/reviews/${stats.benchmark.slug}`}
                className="text-cream underline decoration-ember/40 underline-offset-4 transition-colors hover:decoration-ember"
              >
                {stats.benchmark.name}
              </Link>
              , which is the favourite and the fixed point everything else
              moves relative to.
            </>
          )}
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-16 space-y-4">
        <p className="eyebrow">How the scoring works</p>
        <p className="text-sm leading-relaxed text-muted">
          Zero to three stars, Michelin-style, rather than out of ten — a
          finer scale would imply a precision I don&rsquo;t actually have.
          Zero stars still means it was rated, just badly; &ldquo;not yet
          rated&rdquo; is a separate, honest state for the handful of
          places I visited but never wrote a verdict for.
        </p>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {TIER_ORDER.map((t) => (
            <li key={t} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <TierBadge tier={t} />
              <span className="flex-1 text-sm text-muted">
                {TIERS[t].blurb}
              </span>
              <span className="font-display text-lg">
                {tierCounts[t] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.15} className="mt-16 space-y-4">
        <p className="eyebrow">What I actually like</p>
        <p className="leading-[1.85] text-cream/80">
          On paper my favourites are Japanese and French cooking. In
          practice the top of this list is Thai, Korean, Filipino and
          modern Asian — char, smoke, ferment, heat, depth. Tasting and set
          menus are a comfort zone, and counter or chef&rsquo;s-table seating
          is a habit rather than a rule.
        </p>
        <p className="leading-[1.85] text-cream/80">
          The repeat visits cluster at the casual, bold-flavour end. Fine
          dining tends to be a one-and-done collection exercise — which
          shows up clearly in how few starred restaurants here are marked
          &ldquo;been back&rdquo;.
        </p>
      </Reveal>

      <Reveal delay={0.2} className="mt-16 space-y-4">
        <p className="eyebrow">The fine print</p>
        <p className="leading-[1.85] text-cream/80">
          Everything here is paid for out of my own pocket. Dates and
          addresses come from the original booking where one exists, so if
          a place has moved or closed since, the review reflects where it
          was on the night. {stats.openQuestions} entries are still missing
          a verdict — they&rsquo;re marked as such rather than quietly
          filled in.
        </p>
      </Reveal>
    </div>
  );
}

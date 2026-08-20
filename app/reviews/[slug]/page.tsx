import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { reviews, reviewsByDate, getReview } from "@/data/reviews";
import { TIERS } from "@/lib/tiers";
import { coverFor, placeholderGradient } from "@/lib/photos";
import { formatDate, formatTime } from "@/lib/format";
import TierBadge from "@/components/TierBadge";
import Reveal from "@/components/Reveal";
import Gallery from "@/components/Gallery";
import ReviewCard from "@/components/ReviewCard";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return reviews.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) return {};
  return {
    title: review.name,
    description: review.verdict,
    openGraph: { title: review.name, description: review.verdict },
  };
}

/** Booking times only exist on calendar-sourced entries, not ledger dates. */
function hasTime(iso: string) {
  return iso.length > 10;
}

export default async function ReviewPage({ params }: Params) {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) notFound();

  const cover = coverFor(review.slug);
  const more = reviewsByDate
    .filter((r) => r.slug !== review.slug && r.city === review.city)
    .slice(0, 3);

  return (
    <article className="pb-24">
      {/* ---- Hero ---- */}
      <header className="relative">
        <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
          {cover ? (
            <Image
              src={cover.src}
              alt={review.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: placeholderGradient(review.slug) }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        </div>

        <div className="mx-auto -mt-40 max-w-3xl px-6">
          <Reveal>
            <Link
              href="/reviews"
              className="text-sm text-muted transition-colors hover:text-cream"
            >
              ← All reviews
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <TierBadge tier={review.tier} size="lg" />
              <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                {review.cuisine}
              </span>
              {review.price && (
                <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                  {review.price}
                </span>
              )}
              {review.revisited && (
                <span className="rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-xs text-ember">
                  Been back
                </span>
              )}
              {review.closed && (
                <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
                  Permanently closed
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              {review.name}
            </h1>

            <p className="mt-5 font-display text-2xl leading-snug text-muted">
              {review.verdict}
            </p>

            <div className="mt-8 grid gap-5 border-y border-line py-6 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="eyebrow">Visited</p>
                <p>
                  {review.visitedAt ? (
                    <>
                      {formatDate(review.visitedAt)}
                      {hasTime(review.visitedAt) &&
                        ` · ${formatTime(review.visitedAt)}`}
                    </>
                  ) : (
                    <span className="text-muted">Not recorded</span>
                  )}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="eyebrow">Where</p>
                <p className="text-muted">
                  {review.address ?? `${review.city} — address not logged`}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-3xl space-y-16 px-6">
        {/* ---- The diner's own words ---- */}
        {review.quote && (
          <Reveal>
            <figure className="rounded-2xl border border-line bg-surface p-7">
              <p className="eyebrow">In my own words</p>
              <blockquote className="mt-4 font-display text-2xl leading-snug">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-xs text-muted">
                Verbatim from the verdict ledger.
              </figcaption>
            </figure>
          </Reveal>
        )}

        {/* ---- Body ---- */}
        <Reveal className="space-y-6">
          {review.body.map((p, i) => (
            <p
              key={i}
              className={`leading-[1.85] ${
                i === 0 ? "text-xl text-cream" : "text-[1.0625rem] text-cream/80"
              }`}
            >
              {p}
            </p>
          ))}
        </Reveal>

        {/* ---- Dishes ---- */}
        {review.dishes.length > 0 && (
          <Reveal className="space-y-4">
            <p className="eyebrow">Dishes worth noting</p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {review.dishes.map((d) => (
                <li key={d.name} className="px-6 py-5">
                  <p className="font-display text-xl">{d.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {d.note}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* ---- Open question ---- */}
        {review.needsCheck && (
          <Reveal>
            <div className="rounded-2xl border border-dashed border-gold/30 bg-gold/[0.06] p-6">
              <p className="eyebrow text-gold">Needs filling in</p>
              <p className="mt-3 leading-relaxed text-cream/80">
                {review.needsCheck}
              </p>
            </div>
          </Reveal>
        )}

        {/* ---- Photos ---- */}
        <Reveal>
          <Gallery slug={review.slug} name={review.name} />
        </Reveal>

        {/* ---- Verdict footer ---- */}
        <Reveal>
          <div className="rounded-2xl border border-line bg-surface px-6 py-5">
            <p className="eyebrow">Verdict</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <TierBadge tier={review.tier} size="lg" />
              <p className="text-sm text-muted">{TIERS[review.tier].blurb}</p>
            </div>
          </div>
        </Reveal>

        {/* ---- Tags ---- */}
        {review.tags.length > 0 && (
          <Reveal className="flex flex-wrap gap-2">
            {review.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
              >
                {t}
              </span>
            ))}
          </Reveal>
        )}
      </div>

      {/* ---- More in this city ---- */}
      {more.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-8">
            <p className="eyebrow">Nearby</p>
            <h2 className="mt-2 font-display text-3xl">
              More from {review.city}
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.06}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

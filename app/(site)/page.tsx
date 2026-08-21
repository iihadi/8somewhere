import Link from "next/link";
import { getAllReviews, getWishlist } from "@/lib/repo";
import { getStats, onThisDay, publishedOnly, sortByDate } from "@/lib/derive";
import ReviewCard from "@/components/ReviewCard";
import Badges from "@/components/Badges";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import TierBadge from "@/components/TierBadge";
import ClosedBadge from "@/components/ClosedBadge";
import AnimatedNumber from "@/components/AnimatedNumber";
import { formatShortDate } from "@/lib/format";
import { sortFeatured } from "@/lib/derive";
import StylePill from "@/components/StylePill";

export const dynamic = "force-dynamic";

/** "3 years ago today", from the raw ISO year — no timezone involved. */
function yearsAgo(iso: string) {
  const diff = new Date().getFullYear() - Number(iso.slice(0, 4));
  if (diff <= 0) return "earlier this year";
  return `${diff} year${diff === 1 ? "" : "s"} ago today`;
}

export default async function Home() {
  const reviews = publishedOnly(await getAllReviews());
  const stats = getStats(reviews);
  const recent = sortByDate(reviews)
    .filter((r) => r.visitedAt)
    .slice(0, 6);
  const loved = sortFeatured(reviews.filter((r) => r.tier === "loved"));
  const avoid = reviews.filter((r) => r.tier === "avoid");
  const throwback = onThisDay(reviews);
  /** The badge answer to "where should I eat" — not the same as the
      star ranking, which is about how good the food was. */
  const mustVisit = reviews.filter((r) =>
    (r.badges ?? []).includes("must-visit")
  );
  const futureDestinations = await getWishlist();

  return (
    <>
      <Hero stats={stats} tileReviews={sortByDate(reviews)} />

      {/* ---- Stats strip ---- */}
      <section className="mx-auto max-w-6xl px-6">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {[
              { k: "Restaurants", v: stats.total },
              { k: "Cities", v: stats.cities },
              { k: "Three stars", v: stats.loved },
              {
                k: stats.repeats === 1 ? "Place revisited" : "Places revisited",
                v: stats.repeats,
              },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-6 py-8">
                <dd className="font-display text-4xl">
                  <AnimatedNumber value={s.v} />
                </dd>
                <dt className="eyebrow mt-2">{s.k}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---- On this day ---- */}
      {throwback.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <Reveal>
            <div className="rounded-2xl border border-ember/25 bg-ember/[0.05] p-6 sm:p-8">
              <p className="eyebrow text-ember">On this day</p>
              <ul className="mt-4 space-y-4">
                {throwback.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/reviews/${r.slug}`}
                      className="group flex flex-wrap items-baseline gap-x-3 gap-y-1"
                    >
                      <span className="font-display text-2xl transition-colors group-hover:text-ember">
                        {r.name}
                      </span>
                      <span className="text-sm text-muted">
                        {yearsAgo(r.visitedAt!)} · {r.city}
                      </span>
                      <span className="w-full text-sm text-muted">
                        {r.verdict}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---- Three stars ---- */}
      {loved.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10">
            <p className="eyebrow">★ ★ ★</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Three stars
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              For the exceptional meal. These are the restaurants that are worth going out of your way for!
            </p>
          </Reveal>

          <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {loved.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.04}>
                <li>
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="group flex items-center gap-5 px-6 py-5 transition-colors hover:bg-surface-2"
                  >
                    <span className="font-display text-2xl text-muted transition-colors group-hover:text-ember">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-display text-xl">
                          {r.name}
                        </span>
                        {r.closed && <ClosedBadge size="sm" />}
                      </span>
                      <span className="block truncate text-sm text-muted">
                        {r.cuisine} · {r.city}
                        {r.visitedAt && ` · ${formatShortDate(r.visitedAt)}`}
                      </span>
                    </span>
                    <span className="hidden max-w-xs shrink-0 text-right text-sm text-muted lg:block">
                      {r.verdict}
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {/* ---- Must visit ---- */}
      {mustVisit.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10">
            <p className="eyebrow">If you only go to one</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Where I&rsquo;d send you
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Not the same list as the three stars. These are the ones I
              tell people to book.
            </p>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mustVisit.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.04}>
                <li className="h-full">
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ember/40"
                  >
                    <span className="flex flex-wrap gap-1.5">
                      <Badges badges={r.badges} size="sm" limit={2} />
                    </span>
                    <span className="font-display text-2xl leading-tight">
                      {r.name}
                    </span>
                    <span className="text-xs text-muted">
                      {r.cuisine} · {r.city}
                    </span>
                    <span className="mt-auto pt-2 text-sm text-muted">
                      {r.verdict}
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}


      {/* ---- Recent ---- */}
      {recent.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Latest</p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                Most recent meals
              </h2>
            </div>
            <Link
              href="/reviews"
              className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-ember/50 hover:text-cream"
            >
              All {stats.total} →
            </Link>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.06}>
                <ReviewCard review={r} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---- Zero stars ---- */}
      {avoid.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10">
            <p className="eyebrow">For balance</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Zero stars
            </h2>
          </Reveal>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {avoid.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.04}>
                <li>
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-2 px-6 py-5 transition-colors hover:bg-surface-2"
                  >
                    <span className="font-display text-xl">{r.name}</span>
                    {r.closed && <ClosedBadge size="sm" />}
                    <span className="w-full text-sm text-muted sm:w-auto sm:flex-1">
                      {r.verdict}
                    </span>
                    <TierBadge tier={r.tier} size="sm" />
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* future destinations */}
      {futureDestinations.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10">
            <p className="eyebrow">Future destinations</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              A list of restaurants I&rsquo;d like to visit
            </h2>
          </Reveal>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {futureDestinations.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.06}>
                <li className="px-6 py-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-display text-2xl">{d.name}</h2>
                    <span className="text-sm text-muted">{d.city}</span>
                  </div>
                  {d.cuisine && (
                    <p className="mt-3">
                      <StylePill size="md">{d.cuisine}</StylePill>
                    </p>
                  )}
                  <p className="mt-3 leading-relaxed text-muted">{d.note}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {stats.total === 0 && (
        <section className="mx-auto mt-28 max-w-2xl px-6 pb-20 text-center">
          <p className="eyebrow">Empty so far</p>
          <p className="mt-3 font-display text-3xl">Nothing logged yet</p>
          <p className="mt-3 text-muted">
            Add the first one from{" "}
            <Link
              href="/edit/new"
              className="text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
            >
              /edit
            </Link>
            .
          </p>
        </section>
      )}
    </>
  );
}

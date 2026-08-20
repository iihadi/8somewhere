import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { getStats, sortByDate } from "@/lib/derive";
import ReviewCard from "@/components/ReviewCard";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import TierBadge from "@/components/TierBadge";
import { formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const reviews = await getAllReviews();
  const stats = getStats(reviews);
  const recent = sortByDate(reviews)
    .filter((r) => r.visitedAt)
    .slice(0, 6);
  const loved = reviews.filter((r) => r.tier === "loved");
  const avoid = reviews.filter((r) => r.tier === "avoid");

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
              { k: "Been back to", v: stats.repeats },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-6 py-8">
                <dd className="font-display text-4xl">{s.v}</dd>
                <dt className="eyebrow mt-2">{s.k}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---- Three stars ---- */}
      {loved.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-6">
          <Reveal className="mb-10">
            <p className="eyebrow">★ ★ ★</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Three stars
            </h2>
            {stats.benchmark && (
              <p className="mt-4 max-w-xl text-muted">
                Everything else gets measured against{" "}
                <Link
                  href={`/reviews/${stats.benchmark.slug}`}
                  className="text-cream underline decoration-ember/40 underline-offset-4 transition-colors hover:decoration-ember"
                >
                  {stats.benchmark.name}
                </Link>
                . These are the ones that came closest.
              </p>
            )}
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
                      <span className="block truncate font-display text-xl">
                        {r.name}
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
                    {r.closed && (
                      <span className="text-xs uppercase tracking-wider text-muted">
                        now closed
                      </span>
                    )}
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

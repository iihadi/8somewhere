import Link from "next/link";
import { reviewsByDate, stats } from "@/data/reviews";
import ReviewCard from "@/components/ReviewCard";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import { formatShortDate } from "@/lib/format";

export default function Home() {
  const recent = reviewsByDate.slice(0, 6);
  const best = [...reviewsByDate].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <>
      <Hero />

      {/* ---- Stats strip ---- */}
      <section className="mx-auto max-w-6xl px-6">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {[
              { k: "Meals reviewed", v: stats.total },
              { k: "Cities", v: stats.cities },
              { k: "Countries", v: stats.countries },
              { k: "Average score", v: stats.average.toFixed(1) },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-6 py-8">
                <dd className="font-display text-4xl">{s.v}</dd>
                <dt className="eyebrow mt-2">{s.k}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---- Recent ---- */}
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

      {/* ---- Leaderboard ---- */}
      <section className="mx-auto mt-28 max-w-6xl px-6">
        <Reveal className="mb-10">
          <p className="eyebrow">The good ones</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">
            Highest rated
          </h2>
        </Reveal>

        <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {best.map((r, i) => (
            <Reveal key={r.slug} delay={i * 0.05}>
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
                      {r.cuisine} · {r.city} · {formatShortDate(r.visitedAt)}
                    </span>
                  </span>
                  <span className="font-display text-2xl">
                    {r.rating.toFixed(1)}
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}

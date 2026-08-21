import type { Metadata } from "next";
import { getAllReviews } from "@/lib/repo";
import {
  byPrice,
  getStats,
  getTierCounts,
  groupByCity,
  groupByCuisine,
  visitsByYear,
  getBadgeCounts,
  badgesPresent,
  returnCount,
  publishedOnly,
} from "@/lib/derive";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import { BADGES } from "@/lib/badges";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Stars from "@/components/Stars";
import BarRow from "@/components/BarRow";

export const metadata: Metadata = {
  title: "Stats",
  description: "What the collection actually looks like, counted up.",
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const reviews = publishedOnly(await getAllReviews());
  const stats = getStats(reviews);
  const tierCounts = getTierCounts(reviews);
  const cuisines = groupByCuisine(reviews);
  const cities = groupByCity(reviews);
  const years = visitsByYear(reviews);
  const prices = byPrice(reviews);

  const maxCuisine = Math.max(1, ...cuisines.map((c) => c.reviews.length));
  const maxCity = Math.max(1, ...cities.map((c) => c.reviews.length));
  const maxYear = Math.max(1, ...years.map((y) => y.count));
  const maxTier = Math.max(1, ...TIER_ORDER.map((t) => tierCounts[t] ?? 0));
  const maxPrice = Math.max(1, ...prices.map((p) => p.count));

  const undated = reviews.filter((r) => !r.visitedAt).length;

  const badgeKeys = badgesPresent(reviews);
  const badgeCounts = getBadgeCounts(reviews);
  const maxBadge = Math.max(1, ...badgeKeys.map((b) => badgeCounts[b]));

  /** Places I've been back to, most returns first. */
  const repeats = [...reviews]
    .filter((r) => returnCount(r) > 0)
    .sort((a, b) => returnCount(b) - returnCount(a) || a.name.localeCompare(b.name));
  const maxRepeat = Math.max(1, ...repeats.map(returnCount));

  return (
    <div className="mx-auto max-w-4xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">Counted up</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Stats</h1>
        <p className="mt-4 max-w-xl text-muted">
          The shape of {stats.total} meals — what I actually eat, where,
          and how often it lands.
        </p>
      </Reveal>

      {/* ---- Headline numbers ---- */}
      <Reveal>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {[
            { k: "Restaurants", v: stats.total },
            { k: "Cuisines", v: cuisines.length },
            { k: "Cities", v: stats.cities },
            { k: "Countries", v: stats.countries },
            { k: "Meals eaten", v: stats.totalVisits },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-5 py-6">
              <dd className="font-display text-3xl">{s.v}</dd>
              <dt className="eyebrow mt-1.5">{s.k}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-14 grid gap-12 sm:grid-cols-2">
        {/* ---- Ratings ---- */}
        <Reveal>
          <section>
            <h2 className="mb-4 font-display text-2xl">Ratings</h2>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {TIER_ORDER.map((t) => (
                <BarRow
                  key={t}
                  label={
                    <span className="flex items-center gap-2">
                      <Stars tier={t} size="sm" />
                      <span className="text-muted">{TIERS[t].label}</span>
                    </span>
                  }
                  count={tierCounts[t] ?? 0}
                  max={maxTier}
                  accent={TIERS[t].accent}
                />
              ))}
            </div>
          </section>
        </Reveal>

        {/* ---- Price ---- */}
        <Reveal delay={0.05}>
          <section>
            <h2 className="mb-4 font-display text-2xl">Price</h2>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {prices.length > 0 ? (
                prices.map((p) => (
                  <BarRow
                    key={p.price}
                    label={<span className="font-display text-base">{p.price}</span>}
                    count={p.count}
                    max={maxPrice}
                    accent="var(--color-gold)"
                  />
                ))
              ) : (
                <p className="px-1 py-2 text-sm text-muted">
                  No prices recorded yet.
                </p>
              )}
            </div>
          </section>
        </Reveal>
      </div>

      {/* ---- Visits by year ---- */}
      <Reveal className="mt-14">
        <section>
          <h2 className="mb-1 font-display text-2xl">Meals per year</h2>
          <p className="mb-4 text-sm text-muted">
            {undated > 0 &&
              `${undated} undated ${undated === 1 ? "entry is" : "entries are"} left out.`}
          </p>
          <div className="rounded-2xl border border-line bg-surface p-4">
            {years.length > 0 ? (
              years.map((y) => (
                <BarRow
                  key={y.year}
                  label={<span className="tabular-nums">{y.year}</span>}
                  count={y.count}
                  max={maxYear}
                />
              ))
            ) : (
              <p className="px-1 py-2 text-sm text-muted">Nothing dated yet.</p>
            )}
          </div>
        </section>
      </Reveal>

      {/* ---- Badges & returns ---- */}
      <div className="mt-14 grid gap-12 sm:grid-cols-2">
        <Reveal>
          <section>
            <h2 className="mb-1 font-display text-2xl">Badges</h2>
            <p className="mb-4 text-sm text-muted">
              What the stars don&rsquo;t say — whether I&rsquo;d go back.
            </p>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {badgeKeys.length > 0 ? (
                badgeKeys.map((b) => (
                  <BarRow
                    key={b}
                    label={<span className="text-muted">{BADGES[b].label}</span>}
                    count={badgeCounts[b]}
                    max={maxBadge}
                    accent={BADGES[b].accent}
                  />
                ))
              ) : (
                <p className="px-1 py-2 text-sm text-muted">
                  No badges given out yet.
                </p>
              )}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section>
            <h2 className="mb-1 font-display text-2xl">Been back</h2>
            <p className="mb-4 text-sm text-muted">
              {stats.repeats > 0
                ? `${stats.repeats} of ${stats.total} places have earned a return.`
                : "Nowhere has earned a second visit yet."}
            </p>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {repeats.length > 0 ? (
                repeats.slice(0, 10).map((r) => (
                  <BarRow
                    key={r.slug}
                    label={r.name}
                    count={returnCount(r)}
                    max={maxRepeat}
                    accent="var(--color-ember)"
                    href={`/reviews/${r.slug}`}
                  />
                ))
              ) : (
                <p className="px-1 py-2 text-sm text-muted">
                  Nothing revisited yet.
                </p>
              )}
              {repeats.length > 10 && (
                <p className="px-1 pt-3 text-xs text-muted">
                  + {repeats.length - 10} more —{" "}
                  <Link href="/reviews" className="underline underline-offset-4">
                    sort the archive by most visited
                  </Link>
                </p>
              )}
            </div>
          </section>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-12 sm:grid-cols-2">
        {/* ---- Cuisines ---- */}
        <Reveal>
          <section>
            <h2 className="mb-4 font-display text-2xl">Cuisines</h2>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {cuisines.slice(0, 12).map((c) => (
                <BarRow
                  key={c.name}
                  label={c.name}
                  count={c.reviews.length}
                  max={maxCuisine}
                  href={`/cuisines#${encodeURIComponent(c.name)}`}
                />
              ))}
              {cuisines.length > 12 && (
                <p className="px-1 pt-3 text-xs text-muted">
                  + {cuisines.length - 12} more on the cuisines page
                </p>
              )}
            </div>
          </section>
        </Reveal>

        {/* ---- Cities ---- */}
        <Reveal delay={0.05}>
          <section>
            <h2 className="mb-4 font-display text-2xl">Cities</h2>
            <div className="rounded-2xl border border-line bg-surface p-4">
              {cities.map((c) => (
                <BarRow
                  key={c.name}
                  label={c.name}
                  count={c.reviews.length}
                  max={maxCity}
                  accent="var(--color-gold)"
                />
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

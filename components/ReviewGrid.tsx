"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/tiers";
import { BADGES, type BadgeKey } from "@/lib/badges";
import { badgesPresent, visitCount } from "@/lib/derive";
import { parseCuisine } from "@/lib/cuisine";
import ReviewCard from "./ReviewCard";
import Stars from "./Stars";

type Sort = "recent" | "verdict" | "name" | "visits";

function sortKey(r: Review) {
  return r.visitedAt ? +new Date(r.visitedAt) : -Infinity;
}

export default function ReviewGrid({ reviews }: { reviews: Review[] }) {
  const [city, setCity] = useState("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [badge, setBadge] = useState<BadgeKey | "All">("All");
  const [cuisine, setCuisine] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(reviews.map((r) => r.city))).sort()],
    [reviews]
  );

  const tiersPresent = useMemo(
    () => TIER_ORDER.filter((t) => reviews.some((r) => r.tier === t)),
    [reviews]
  );

  const badgeOptions = useMemo(() => badgesPresent(reviews), [reviews]);

  /** Families, not raw strings — see lib/cuisine.ts. */
  const cuisines = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(reviews.map((r) => parseCuisine(r.cuisine, r.cuisineFamily).family))
      ).sort(),
    ],
    [reviews]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = reviews.filter((r) => {
      if (city !== "All" && r.city !== city) return false;
      if (tier !== "All" && r.tier !== tier) return false;
      if (badge !== "All" && !(r.badges ?? []).includes(badge)) return false;
      if (
        cuisine !== "All" &&
        parseCuisine(r.cuisine, r.cuisineFamily).family !== cuisine
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.verdict.toLowerCase().includes(q) ||
        (r.quote ?? "").toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "verdict")
        return (
          TIERS[a.tier].order - TIERS[b.tier].order || sortKey(b) - sortKey(a)
        );
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "visits")
        return visitCount(b) - visitCount(a) || sortKey(b) - sortKey(a);
      return sortKey(b) - sortKey(a);
    });
  }, [reviews, city, tier, badge, cuisine, query, sort]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                city === c ? "text-ink" : "text-muted hover:text-cream"
              }`}
            >
              {city === c && (
                <motion.span
                  layoutId="city-pill"
                  className="absolute inset-0 rounded-full bg-cream"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        {badgeOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBadge("All")}
              className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                badge === "All"
                  ? "border-cream/40 text-cream"
                  : "border-line text-muted hover:text-cream"
              }`}
            >
              Any badge
            </button>
            {badgeOptions.map((b) => {
              const active = badge === b;
              const { label, blurb, accent } = BADGES[b];
              return (
                <button
                  key={b}
                  onClick={() => setBadge(active ? "All" : b)}
                  title={blurb}
                  className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                    active ? "" : "border-line text-muted hover:text-cream"
                  }`}
                  style={
                    active
                      ? {
                          color: accent,
                          borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                          backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTier("All")}
              className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                tier === "All"
                  ? "border-cream/40 text-cream"
                  : "border-line text-muted hover:text-cream"
              }`}
            >
              All ratings
            </button>
            {tiersPresent.map((t) => {
              const active = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className="rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors"
                  style={{
                    color: active ? TIERS[t].accent : undefined,
                    borderColor: active
                      ? `color-mix(in oklab, ${TIERS[t].accent} 45%, transparent)`
                      : undefined,
                    backgroundColor: active
                      ? `color-mix(in oklab, ${TIERS[t].accent} 12%, transparent)`
                      : undefined,
                  }}
                >
                  <span className={active ? "" : "opacity-70"}>
                    <Stars tier={t} size="sm" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              aria-label="Filter by cuisine"
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors focus:border-ember/50"
            >
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All cuisines" : c}
                </option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, cuisines, trips…"
              className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-ember/50 lg:w-60"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors focus:border-ember/50"
            >
              <option value="recent">Most recent</option>
              <option value="verdict">By rating</option>
              <option value="visits">Most visited</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted">
        {shown.length} {shown.length === 1 ? "restaurant" : "restaurants"}
      </p>

      {/*
        Keyed on the active filter so the whole grid remounts and the
        cards replay their entrance stagger. Deliberately not
        AnimatePresence + popLayout: exiting cards never finished their
        exit transition there and accumulated in the DOM.
      */}
      <div
        key={`${city}|${tier}|${badge}|${cuisine}|${sort}|${query}`}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {shown.map((r, i) => (
          <ReviewCard key={r.slug} review={r} index={i} priority={i < 3} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted">
            Try a different city or clear the search.
          </p>
        </div>
      )}
    </div>
  );
}

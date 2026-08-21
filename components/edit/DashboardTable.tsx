"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/tiers";
import { formatShortDate } from "@/lib/format";
import { returnCount } from "@/lib/derive";
import Stars from "@/components/Stars";
import Badges from "@/components/Badges";
import DeleteReviewButton from "./DeleteReviewButton";

type Sort = "recent" | "oldest" | "rating" | "name" | "attention" | "visits";
type Flag =
  | "all"
  | "attention"
  | "no-photos"
  | "no-location"
  | "closed"
  | "no-badge";

function sortKey(r: Review) {
  return r.visitedAt ? +new Date(r.visitedAt) : -Infinity;
}

function needsAttention(r: Review) {
  return r.tier === "unlogged" || Boolean(r.needsCheck);
}

export default function DashboardTable({ reviews }: { reviews: Review[] }) {
  const [city, setCity] = useState("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [flag, setFlag] = useState<Flag>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(reviews.map((r) => r.city))).sort()],
    [reviews]
  );

  const counts = useMemo(
    () => ({
      total: reviews.length,
      attention: reviews.filter(needsAttention).length,
      noPhotos: reviews.filter((r) => !r.photos || r.photos.length === 0).length,
      noLocation: reviews.filter((r) => r.lat == null || r.lng == null).length,
      noBadge: reviews.filter((r) => (r.badges?.length ?? 0) === 0).length,
    }),
    [reviews]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = reviews.filter((r) => {
      if (city !== "All" && r.city !== city) return false;
      if (tier !== "All" && r.tier !== tier) return false;
      if (flag === "attention" && !needsAttention(r)) return false;
      if (flag === "no-photos" && r.photos && r.photos.length > 0) return false;
      if (flag === "no-location" && r.lat != null && r.lng != null) return false;
      if (flag === "closed" && !r.closed) return false;
      if (flag === "no-badge" && (r.badges?.length ?? 0) > 0) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "attention") {
        const diff = Number(needsAttention(b)) - Number(needsAttention(a));
        return diff !== 0 ? diff : sortKey(b) - sortKey(a);
      }
      if (sort === "rating") return TIERS[a.tier].order - TIERS[b.tier].order;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return sortKey(a) - sortKey(b);
      if (sort === "visits")
        return returnCount(b) - returnCount(a) || sortKey(b) - sortKey(a);
      return sortKey(b) - sortKey(a);
    });
  }, [reviews, city, tier, flag, query, sort]);

  return (
    <div className="space-y-6">
      {/* ---- Quick stats ---- */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {[
          { k: "Total", v: counts.total, f: "all" as Flag },
          { k: "Needs attention", v: counts.attention, f: "attention" as Flag },
          { k: "No photos", v: counts.noPhotos, f: "no-photos" as Flag },
          { k: "No pin on map", v: counts.noLocation, f: "no-location" as Flag },
          { k: "No badge yet", v: counts.noBadge, f: "no-badge" as Flag },
        ].map((s) => (
          <button
            key={s.k}
            onClick={() => setFlag(s.f)}
            className={`bg-surface px-5 py-5 text-left transition-colors hover:bg-surface-2 ${
              flag === s.f ? "ring-1 ring-inset ring-ember/40" : ""
            }`}
          >
            <span className="block font-display text-3xl">{s.v}</span>
            <span className="eyebrow mt-1.5 block">{s.k}</span>
          </button>
        ))}
      </div>

      {/* ---- Filters ---- */}
      <div className="space-y-3">
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
                  layoutId="edit-city-pill"
                  className="absolute inset-0 rounded-full bg-cream"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            {TIER_ORDER.map((t) => {
              const active = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className="rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors"
                  style={{
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
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, cuisine, tags…"
              className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-ember/50 lg:w-64"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors focus:border-ember/50"
            >
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest first</option>
              <option value="rating">By rating</option>
              <option value="name">A–Z</option>
              <option value="attention">Needs attention first</option>
              <option value="visits">Most visited</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted">
        {shown.length} of {reviews.length} restaurants
      </p>

      {/* ---- Table ---- */}
      <ul
        key={`${city}|${tier}|${flag}|${sort}|${query}`}
        className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface"
      >
        {shown.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {r.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photos[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-display text-lg">
                {r.name}
                {r.closed && (
                  <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted">
                    Closed
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">
                {r.city} · {r.cuisine}
                {r.visitedAt && ` · ${formatShortDate(r.visitedAt)}`}
                {returnCount(r) > 0 && (
                  <span className="text-ember">
                    {" "}
                    · {returnCount(r) + 1}&times;
                  </span>
                )}
              </p>
              {(r.badges?.length ?? 0) > 0 && (
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badges badges={r.badges} size="sm" limit={2} />
                </p>
              )}
            </div>

            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
              {needsAttention(r) && (
                <span
                  title="Needs a verdict or has an open question"
                  className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-gold"
                >
                  Attention
                </span>
              )}
              {(!r.photos || r.photos.length === 0) && (
                <span
                  title="No photos uploaded"
                  className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-muted"
                >
                  No photos
                </span>
              )}
              {(r.lat == null || r.lng == null) && (
                <span
                  title="No location pinned"
                  className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-muted"
                >
                  No pin
                </span>
              )}
            </div>

            <Stars tier={r.tier} size="sm" />

            <div className="flex shrink-0 items-center gap-4">
              <Link
                href={`/edit/${r.slug}`}
                className="text-sm text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
              >
                Edit
              </Link>
              <DeleteReviewButton slug={r.slug} name={r.name} />
            </div>
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
          Nothing matches those filters.
        </p>
      )}
    </div>
  );
}

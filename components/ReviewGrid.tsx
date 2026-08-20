"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Review } from "@/data/reviews";
import ReviewCard from "./ReviewCard";

type Sort = "recent" | "rating" | "name";

export default function ReviewGrid({ reviews }: { reviews: Review[] }) {
  const [city, setCity] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(reviews.map((r) => r.city))).sort()],
    [reviews]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = reviews.filter((r) => {
      if (city !== "All" && r.city !== city) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      return +new Date(b.visitedAt) - +new Date(a.visitedAt);
    });
  }, [reviews, city, query, sort]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cuisines, trips…"
            className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-ember/50 lg:w-64"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors focus:border-ember/50"
          >
            <option value="recent">Most recent</option>
            <option value="rating">Highest rated</option>
            <option value="name">A–Z</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-muted">
        {shown.length} {shown.length === 1 ? "review" : "reviews"}
      </p>

      <motion.div
        layout
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((r, i) => (
            <ReviewCard key={r.slug} review={r} index={i} priority={i < 3} />
          ))}
        </AnimatePresence>
      </motion.div>

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

"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Review } from "@/data/seed-reviews";
import { searchReviews, type SearchHit } from "@/lib/search";
import { formatShortDate } from "@/lib/format";
import Stars from "./Stars";
import Badges from "./Badges";

const FIELD_LABEL: Record<SearchHit["field"], string> = {
  name: "Name",
  city: "City",
  cuisine: "Cuisine",
  verdict: "Verdict",
  quote: "Quote",
  body: "Write-up",
  dish: "Dish",
  tag: "Tag",
};

export default function SearchClient({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" jumps into the search box from anywhere on the page — the
  // usual convention, and the whole point of a dedicated search page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const active = document.activeElement;
      const typing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => searchReviews(reviews, query), [reviews, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything — try a dish, a quote, a tag…"
          className="w-full rounded-full border border-line bg-surface px-5 py-3.5 text-base outline-none transition-colors placeholder:text-muted focus:border-ember/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-cream"
          >
            Clear
          </button>
        )}
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-muted">Keep typing — two characters minimum.</p>
      )}

      {query.trim().length >= 2 && (
        <>
          <p className="text-sm text-muted">
            {hits.length} {hits.length === 1 ? "match" : "matches"}
          </p>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {hits.map(({ review, field, snippet }) => (
              <li key={review.slug}>
                <Link
                  href={`/reviews/${review.slug}`}
                  className="block px-5 py-4 transition-colors hover:bg-surface-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex min-w-0 items-baseline gap-2.5">
                      <span className="truncate font-display text-lg">
                        {review.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {review.city}
                        {review.visitedAt && ` · ${formatShortDate(review.visitedAt)}`}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badges badges={review.badges} size="sm" limit={1} />
                      <Stars tier={review.tier} size="sm" />
                    </span>
                  </div>
                  {field !== "name" && (
                    <p className="mt-1.5 text-sm text-muted">
                      <span className="text-ember">{FIELD_LABEL[field]}:</span>{" "}
                      &ldquo;{snippet}&rdquo;
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {hits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="font-display text-xl">No matches</p>
              <p className="mt-2 text-sm text-muted">
                Try a shorter word or a different spelling.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

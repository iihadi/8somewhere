"use client";

import { useState } from "react";
import type { EnrichMatch } from "@/app/api/edit/enrich/route";
import Spinner from "@/components/Spinner";
import { inputCls, hintCls, labelCls } from "./fields";

/**
 * Populates restaurant metadata from OpenStreetMap instead of typing
 * it all in by hand — search a name (+ optional city to narrow it),
 * pick the right match, and the caller decides which fields to fill.
 * Free, no API key, same service /api/edit/geocode already uses.
 */
export default function RestaurantLookup({
  defaultQuery,
  defaultCity,
  onPick,
  label = "Look up restaurant details (fills in cuisine, address, coordinates)",
}: {
  defaultQuery: string;
  defaultCity?: string;
  onPick: (match: EnrichMatch) => void;
  label?: string;
}) {
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity ?? "");
  const [results, setResults] = useState<EnrichMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const url = `/api/edit/enrich?q=${encodeURIComponent(query)}${
        city ? `&city=${encodeURIComponent(city)}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed.");
      setResults(data.results ?? []);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="relative space-y-1.5 rounded-lg border border-line p-3">
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap gap-2">
        <input
          className={`${inputCls} flex-1`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          placeholder="Restaurant name"
        />
        <input
          className={`${inputCls} w-36`}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          placeholder="City (optional)"
        />
        <button
          type="button"
          onClick={search}
          disabled={searching || !query.trim()}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-cream transition-colors hover:border-ember/40 disabled:opacity-50"
        >
          {searching && <Spinner className="h-3.5 w-3.5" />}
          {searching ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <p className="text-xs text-[#e0554f]">{error}</p>}

      {open && results.length > 0 && (
        <ul className="mt-1 divide-y divide-line overflow-hidden rounded-lg border border-line">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onPick(r);
                  setOpen(false);
                }}
                className="block w-full px-3.5 py-2.5 text-left text-sm hover:bg-surface-2"
              >
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium text-cream">{r.name}</span>
                  {r.cuisine && <span className="text-xs text-muted">{r.cuisine}</span>}
                </span>
                {r.address && (
                  <span className="block truncate text-xs text-muted">{r.address}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && results.length === 0 && (
        <p className={hintCls}>No matches — try a different spelling or add the city.</p>
      )}
    </div>
  );
}

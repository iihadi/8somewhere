"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { TIERS, TIER_ORDER, type Tier } from "@/lib/tiers";
import { BADGE_ORDER, BADGES, type BadgeKey } from "@/lib/badges";
import { formatShortDate } from "@/lib/format";
import { returnCount } from "@/lib/derive";
import Stars from "@/components/Stars";
import Badges from "@/components/Badges";
import ClosedBadge from "@/components/ClosedBadge";
import Spinner from "@/components/Spinner";
import DeleteReviewButton from "./DeleteReviewButton";

type Sort = "recent" | "oldest" | "rating" | "name" | "attention" | "visits";
type Flag =
  | "all"
  | "attention"
  | "no-photos"
  | "no-location"
  | "closed"
  | "no-badge"
  | "draft";

function sortKey(r: Review) {
  return r.visitedAt ? +new Date(r.visitedAt) : -Infinity;
}

function needsAttention(r: Review) {
  return r.tier === "unlogged" || Boolean(r.needsCheck);
}

export default function DashboardTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [city, setCity] = useState("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [flag, setFlag] = useState<Flag>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
      draft: reviews.filter((r) => r.draft).length,
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
      if (flag === "draft" && !r.draft) return false;
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

  function toggle(slug: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.slug));

  function toggleAllShown() {
    setSelected((s) => {
      if (allShownSelected) {
        const next = new Set(s);
        for (const r of shown) next.delete(r.slug);
        return next;
      }
      return new Set([...s, ...shown.map((r) => r.slug)]);
    });
  }

  return (
    <div className="space-y-6">
      {/* ---- Quick stats ---- */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {[
          { k: "Total", v: counts.total, f: "all" as Flag },
          { k: "Needs attention", v: counts.attention, f: "attention" as Flag },
          { k: "No photos", v: counts.noPhotos, f: "no-photos" as Flag },
          { k: "No pin on map", v: counts.noLocation, f: "no-location" as Flag },
          { k: "No badge yet", v: counts.noBadge, f: "no-badge" as Flag },
          { k: "Drafts", v: counts.draft, f: "draft" as Flag },
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={allShownSelected}
            onChange={toggleAllShown}
            aria-label="Select all shown"
            className="h-4 w-4 accent-[var(--color-ember)]"
          />
          {selected.size > 0
            ? `${selected.size} selected`
            : `${shown.length} of ${reviews.length} restaurants`}
        </label>
        {selected.size > 0 && (
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-cream"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* ---- Table ---- */}
      <ul
        key={`${city}|${tier}|${flag}|${sort}|${query}`}
        className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface"
      >
        {shown.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <input
              type="checkbox"
              checked={selected.has(r.slug)}
              onChange={() => toggle(r.slug)}
              aria-label={`Select ${r.name}`}
              className="h-4 w-4 shrink-0 accent-[var(--color-ember)]"
            />
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
                {r.draft && (
                  <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-gold">
                    Draft
                  </span>
                )}
                {r.closed && <ClosedBadge size="sm" />}
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

      {selected.size > 0 && (
        <BulkActionBar
          slugs={[...selected]}
          onDone={() => {
            setSelected(new Set());
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

type BulkAction =
  | "add-tag"
  | "remove-tag"
  | "add-badge"
  | "remove-badge"
  | "set-city"
  | "mark-draft"
  | "mark-published";

const NEEDS_VALUE: BulkAction[] = [
  "add-tag",
  "remove-tag",
  "add-badge",
  "remove-badge",
  "set-city",
];

/**
 * Sticky bar that appears once at least one row is checked. Applies
 * one action to every selected review in a single request — see
 * /api/edit/reviews/bulk and lib/repo.ts's bulkUpdateReviews.
 */
function BulkActionBar({
  slugs,
  onDone,
}: {
  slugs: string[];
  onDone: () => void;
}) {
  const [action, setAction] = useState<BulkAction>("add-tag");
  const [value, setValue] = useState("");
  const [badge, setBadge] = useState<BadgeKey>(BADGE_ORDER[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBadgeAction = action === "add-badge" || action === "remove-badge";
  const needsValue = NEEDS_VALUE.includes(action);
  const resolvedValue = isBadgeAction ? badge : value.trim();
  const canApply = !needsValue || Boolean(resolvedValue);

  async function apply() {
    if (!canApply) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/edit/reviews/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs, action, value: resolvedValue || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Bulk update failed.");
      setValue("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-ember/30 bg-ink/95 p-4 shadow-lg shadow-black/40 backdrop-blur-sm">
      <span className="text-sm font-medium text-cream">
        {slugs.length} selected
      </span>

      <select
        value={action}
        onChange={(e) => {
          setAction(e.target.value as BulkAction);
          setValue("");
        }}
        className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm outline-none focus:border-ember/50"
      >
        <option value="add-tag">Add tag</option>
        <option value="remove-tag">Remove tag</option>
        <option value="add-badge">Add badge</option>
        <option value="remove-badge">Remove badge</option>
        <option value="set-city">Set city</option>
        <option value="mark-draft">Mark as draft</option>
        <option value="mark-published">Mark as published</option>
      </select>

      {isBadgeAction && (
        <select
          value={badge}
          onChange={(e) => setBadge(e.target.value as BadgeKey)}
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm outline-none focus:border-ember/50"
        >
          {BADGE_ORDER.map((b) => (
            <option key={b} value={b}>
              {BADGES[b].label}
            </option>
          ))}
        </select>
      )}

      {needsValue && !isBadgeAction && (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={action === "set-city" ? "City name" : "Tag text"}
          className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm outline-none placeholder:text-muted focus:border-ember/50"
        />
      )}

      <button
        onClick={apply}
        disabled={busy || !canApply}
        className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-ink transition-opacity disabled:opacity-50"
      >
        {busy && <Spinner />}
        {busy ? "Applying…" : "Apply"}
      </button>

      {error && <span className="text-xs text-[#e0554f]">{error}</span>}
    </div>
  );
}

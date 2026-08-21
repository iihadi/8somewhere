"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import Stars from "@/components/Stars";
import Spinner from "@/components/Spinner";

type Item = { slug: string; name: string; cuisine: string; city: string };

/**
 * Drag-and-drop order for the homepage "Three stars" list. Reordering
 * is optimistic and local until "Save order" persists it as each
 * review's `featuredRank` via PATCH /api/edit/reviews/reorder — dragging
 * doesn't autosave on every swap, since that would fire a write per
 * pixel of drag.
 */
export default function FeaturedReorder({ reviews }: { reviews: Review[] }) {
  const [items, setItems] = useState<Item[]>(
    reviews.map((r) => ({ slug: r.slug, name: r.name, cuisine: r.cuisine, city: r.city }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onReorder(next: Item[]) {
    setItems(next);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/edit/reviews/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: items.map((i) => i.slug) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save order.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order.");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
        Nothing rated &ldquo;Loved it&rdquo; yet — the three-star list fills
        in once something is.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Drag to set the order the homepage shows them in. Anything you
        haven&rsquo;t touched falls back to most-recently-visited first.
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onReorder}
        className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface"
      >
        {items.map((item, i) => (
          <FeaturedRow key={item.slug} item={item} index={i} />
        ))}
      </Reorder.Group>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || saved}
          className="flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-opacity disabled:opacity-50"
        >
          {saving && <Spinner />}
          {saving ? "Saving…" : saved ? "Saved" : "Save order"}
        </button>
        {error && <span className="text-sm text-[#e0554f]">{error}</span>}
      </div>
    </div>
  );
}

function FeaturedRow({ item, index }: { item: Item; index: number }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-4 bg-surface px-5 py-4"
      whileDrag={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
    >
      <span className="font-display text-lg text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg">{item.name}</p>
        <p className="truncate text-xs text-muted">
          {item.cuisine} · {item.city}
        </p>
      </div>
      <Stars tier="loved" size="sm" />
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`Drag to reorder ${item.name}`}
        className="grid h-9 w-9 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-cream active:cursor-grabbing"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>
    </Reorder.Item>
  );
}

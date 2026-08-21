"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WishlistItem } from "@/data/seed-reviews";
import type { EnrichMatch } from "@/app/api/edit/enrich/route";
import { slugify, SLUG_RE } from "@/lib/slug";
import Spinner from "@/components/Spinner";
import StylePill from "@/components/StylePill";
import RestaurantLookup from "./RestaurantLookup";
import { inputCls, labelCls } from "./fields";

const EMPTY = { name: "", city: "", note: "", cuisine: "" };

export default function WishlistManager({ items }: { items: WishlistItem[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const [lookupId, setLookupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function applyLookup(item: WishlistItem, match: EnrichMatch) {
    const patch: Partial<WishlistItem> = { cuisine: match.cuisine || item.cuisine };
    if (item.city === "—" && match.city) patch.city = match.city;
    setList((l) => l.map((w) => (w.id === item.id ? { ...w, ...patch } : w)));
    setLookupId(null);
    const res = await fetch(`/api/edit/wishlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) setError("Failed to save the lookup — try again.");
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/edit/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          cuisine: draft.cuisine || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add.");
      setList((l) => [data.item, ...l]);
      setDraft(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add.");
    } finally {
      setAdding(false);
    }
  }

  async function removeItem(id: string) {
    const prev = list;
    setList((l) => l.filter((w) => w.id !== id));
    const res = await fetch(`/api/edit/wishlist/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setList(prev);
      setError("Failed to remove — try again.");
    }
  }

  /**
   * Turns a wishlist entry into a draft review, prefilled with what's
   * already known, then removes it from the wishlist and jumps
   * straight into the new draft to finish writing it up.
   */
  function draftPayload(item: WishlistItem, slug: string) {
    return {
      slug,
      name: item.name,
      city: item.city === "—" ? "" : item.city,
      country: "",
      address: null,
      cuisine: item.cuisine ?? "",
      visitedAt: null,
      price: null,
      tier: "unlogged",
      quote: null,
      verdict: "",
      dishes: [],
      body: [],
      tags: [],
      photos: [],
      draft: true,
      needsCheck: item.note || undefined,
    };
  }

  async function createDraft(item: WishlistItem, slug: string) {
    const res = await fetch("/api/edit/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftPayload(item, slug)),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, error: data.error as string | undefined };
  }

  async function convert(item: WishlistItem) {
    setConverting(item.id);
    setError(null);
    try {
      let slug = slugify(item.name);
      if (!SLUG_RE.test(slug)) slug = `wishlist-${item.id}`;

      let result = await createDraft(item, slug);
      // A slug collision is the only realistic failure — retry once
      // with a suffix rather than making the user deal with it.
      if (!result.ok && result.status === 409) {
        slug = `${slug}-${item.id.slice(-5)}`;
        result = await createDraft(item, slug);
      }
      if (!result.ok) throw new Error(result.error ?? "Failed to convert.");

      await fetch(`/api/edit/wishlist/${item.id}`, { method: "DELETE" });
      router.push(`/edit/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert.");
      setConverting(null);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={addItem}
        className="grid gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"
      >
        <div className="space-y-1.5">
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Restaurant name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>City</label>
          <input
            className={inputCls}
            value={draft.city}
            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>Kind of restaurant (optional)</label>
          <input
            className={inputCls}
            value={draft.cuisine}
            onChange={(e) => setDraft((d) => ({ ...d, cuisine: e.target.value }))}
            placeholder="e.g. Modern British tasting menu"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls}>Note</label>
          <input
            className={inputCls}
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            placeholder="Booked ahead, waiting on a birthday, etc."
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <button
            type="submit"
            disabled={adding || !draft.name.trim()}
            className="flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-opacity disabled:opacity-50"
          >
            {adding && <Spinner />}
            Add to the list
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg border border-[#e0554f]/30 bg-[#e0554f]/10 px-4 py-3 text-sm text-[#e0554f]">
          {error}
        </p>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {list.map((w) => (
          <li key={w.id} className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-display text-lg">{w.name}</span>
                  {w.cuisine && <StylePill>{w.cuisine}</StylePill>}
                </p>
                <p className="truncate text-xs text-muted">
                  {w.city}
                  {w.note && ` · ${w.note}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!w.cuisine && (
                  <button
                    type="button"
                    onClick={() => setLookupId(lookupId === w.id ? null : w.id)}
                    className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-cream"
                  >
                    {lookupId === w.id ? "Cancel lookup" : "Look up details"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => convert(w)}
                  disabled={converting === w.id}
                  className="flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-3.5 py-1.5 text-xs text-ember transition-opacity disabled:opacity-50"
                >
                  {converting === w.id && <Spinner className="h-3 w-3" />}
                  {converting === w.id ? "Converting…" : "Convert to draft review"}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(w.id)}
                  className="text-sm text-muted hover:text-[#e0554f]"
                >
                  Remove
                </button>
              </div>
            </div>
            {lookupId === w.id && (
              <div className="mt-3">
                <RestaurantLookup
                  defaultQuery={w.name}
                  defaultCity={w.city === "—" ? "" : w.city}
                  onPick={(match) => applyLookup(w, match)}
                  label="Search to fill in the kind of restaurant"
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
          Nothing on the list.
        </p>
      )}
    </div>
  );
}

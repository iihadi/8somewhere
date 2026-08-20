"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dish, Photo, Review } from "@/data/seed-reviews";
import { TIER_ORDER, TIERS, type Tier } from "@/lib/tiers";
import type { GeocodeResult } from "@/app/api/edit/geocode/route";
import Stars from "@/components/Stars";
import Spinner from "@/components/Spinner";

type Mode = "create" | "edit";

const EMPTY: Omit<Review, "slug"> = {
  name: "",
  city: "",
  country: "UK",
  address: null,
  lat: undefined,
  lng: undefined,
  cuisine: "",
  visitedAt: null,
  price: null,
  tier: "unlogged",
  quote: null,
  verdict: "",
  dishes: [],
  body: [],
  tags: [],
  photos: [],
  closed: undefined,
  revisited: undefined,
  needsCheck: undefined,
};

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ember/50";
const labelCls = "text-xs uppercase tracking-wider text-muted";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ReviewForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: Review;
}) {
  const router = useRouter();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [fields, setFields] = useState<Omit<Review, "slug">>(
    initial
      ? {
          name: initial.name,
          city: initial.city,
          country: initial.country,
          address: initial.address,
          lat: initial.lat,
          lng: initial.lng,
          cuisine: initial.cuisine,
          visitedAt: initial.visitedAt,
          price: initial.price,
          tier: initial.tier,
          quote: initial.quote,
          verdict: initial.verdict,
          dishes: initial.dishes,
          body: initial.body,
          tags: initial.tags,
          photos: initial.photos ?? [],
          closed: initial.closed,
          revisited: initial.revisited,
          needsCheck: initial.needsCheck,
        }
      : EMPTY
  );
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ---- location lookup (OpenStreetMap / Nominatim) ----
  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<GeocodeResult[]>([]);
  const [locOpen, setLocOpen] = useState(false);
  const [locSearching, setLocSearching] = useState(false);
  const locDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (locDebounce.current) clearTimeout(locDebounce.current);
    if (locQuery.trim().length < 3) {
      setLocResults([]);
      return;
    }
    locDebounce.current = setTimeout(async () => {
      setLocSearching(true);
      try {
        const res = await fetch(`/api/edit/geocode?q=${encodeURIComponent(locQuery)}`);
        const data = await res.json();
        setLocResults(data.results ?? []);
        setLocOpen(true);
      } catch {
        setLocResults([]);
      } finally {
        setLocSearching(false);
      }
    }, 500);
    return () => {
      if (locDebounce.current) clearTimeout(locDebounce.current);
    };
  }, [locQuery]);

  function pickLocation(r: GeocodeResult) {
    setFields((f) => ({
      ...f,
      address: r.address ?? f.address,
      city: r.city || f.city,
      country: r.country || f.country,
      lat: r.lat,
      lng: r.lng,
    }));
    setLocQuery("");
    setLocResults([]);
    setLocOpen(false);
  }

  function clearLocation() {
    set("lat", undefined);
    set("lng", undefined);
  }

  function set<K extends keyof Omit<Review, "slug">>(key: K, value: Omit<Review, "slug">[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function onNameChange(v: string) {
    set("name", v);
    if (mode === "create" && !slugTouched) setSlug(slugify(v));
  }

  // ---- dishes ----
  function addDish() {
    set("dishes", [...fields.dishes, { name: "", note: "" }]);
  }
  function updateDish(i: number, patch: Partial<Dish>) {
    set(
      "dishes",
      fields.dishes.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    );
  }
  function removeDish(i: number) {
    set("dishes", fields.dishes.filter((_, idx) => idx !== i));
  }

  // ---- body paragraphs ----
  function addParagraph() {
    set("body", [...fields.body, ""]);
  }
  function updateParagraph(i: number, value: string) {
    set("body", fields.body.map((p, idx) => (idx === i ? value : p)));
  }
  function removeParagraph(i: number) {
    set("body", fields.body.filter((_, idx) => idx !== i));
  }

  // ---- photos ----
  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!SLUG_RE.test(slug)) {
      setError("Set a valid slug before uploading photos.");
      return;
    }
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch(`/api/edit/upload?slug=${encodeURIComponent(slug)}`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        const photo: Photo = { url: data.url, width: data.width, height: data.height };
        setFields((f) => ({ ...f, photos: [...f.photos!, photo] }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setUploading(false);
  }

  async function removePhoto(i: number) {
    const photo = fields.photos![i];
    set("photos", fields.photos!.filter((_, idx) => idx !== i));
    // Best-effort — don't block the UI on cleanup succeeding.
    fetch("/api/edit/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: photo.url }),
    }).catch(() => {});
  }

  /** Move a photo one slot left/right. Position 0 is the cover image. */
  function movePhoto(i: number, dir: -1 | 1) {
    const next = [...fields.photos!];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("photos", next);
  }

  function setCaption(i: number, caption: string) {
    set(
      "photos",
      fields.photos!.map((p, idx) =>
        idx === i ? { ...p, caption: caption || undefined } : p
      )
    );
  }

  // ---- save / delete ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !SLUG_RE.test(slug)) {
      setError("Slug must be lowercase letters, numbers and hyphens only.");
      return;
    }
    if (!fields.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = { ...fields, tags, slug };

    const res =
      mode === "create"
        ? await fetch("/api/edit/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/edit/reviews/${initial!.slug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    if (res.ok) {
      router.push("/edit");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to save.");
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10 pb-24">
      {/* ---- Identity ---- */}
      <section className="space-y-4">
        <p className="eyebrow">Identity</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={fields.name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>
              Slug {mode === "edit" && "(fixed — the URL depends on it)"}
            </label>
            <input
              className={inputCls}
              value={slug}
              disabled={mode === "edit"}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="some-restaurant"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>City</label>
            <input
              className={inputCls}
              value={fields.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Country</label>
            <input
              className={inputCls}
              value={fields.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>Address (optional)</label>
            <input
              className={inputCls}
              value={fields.address ?? ""}
              onChange={(e) => set("address", e.target.value || null)}
            />
          </div>

          <div className="relative space-y-1.5 sm:col-span-2">
            <label className={labelCls}>
              Look up on the map (OpenStreetMap — free, no key needed)
            </label>
            <input
              className={inputCls}
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              onFocus={() => locResults.length > 0 && setLocOpen(true)}
              placeholder="Search by name and city — e.g. Septime Paris"
            />
            {locSearching && (
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Spinner className="h-3 w-3" />
                Searching…
              </p>
            )}

            {locOpen && locResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                {locResults.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => pickLocation(r)}
                      className="block w-full px-3.5 py-2.5 text-left text-sm hover:bg-surface-2"
                    >
                      <span className="block truncate">{r.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {fields.lat != null && fields.lng != null && (
              <div className="mt-2 space-y-2">
                <div className="overflow-hidden rounded-lg border border-line">
                  <iframe
                    title="Location preview"
                    className="h-48 w-full"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      fields.lng - 0.006
                    }%2C${fields.lat - 0.004}%2C${fields.lng + 0.006}%2C${
                      fields.lat + 0.004
                    }&layer=mapnik&marker=${fields.lat}%2C${fields.lng}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {fields.lat.toFixed(5)}, {fields.lng.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-xs text-muted hover:text-[#e0554f]"
                  >
                    Remove pin
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Cuisine</label>
            <input
              className={inputCls}
              value={fields.cuisine}
              onChange={(e) => set("cuisine", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Price (£ – ££££, optional)</label>
            <input
              className={inputCls}
              value={fields.price ?? ""}
              onChange={(e) => set("price", e.target.value || null)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>
              Visited (ISO date/time, e.g. 2026-09-01T19:30:00+01:00 — optional)
            </label>
            <input
              className={inputCls}
              value={fields.visitedAt ?? ""}
              onChange={(e) => set("visitedAt", e.target.value || null)}
              placeholder="2026-09-01 or 2026-09-01T19:30:00+01:00"
            />
          </div>
        </div>
      </section>

      {/* ---- Verdict ---- */}
      <section className="space-y-4">
        <p className="eyebrow">Verdict</p>

        <div className="space-y-1.5">
          <label className={labelCls}>Rating</label>
          <div className="flex flex-wrap gap-2">
            {TIER_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("tier", t)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  fields.tier === t
                    ? "border-cream/40 bg-surface-2"
                    : "border-line text-muted hover:text-cream"
                }`}
              >
                <Stars tier={t} size="sm" />
                <span>{TIERS[t].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Card summary (verdict)</label>
          <input
            className={inputCls}
            value={fields.verdict}
            onChange={(e) => set("verdict", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Quote — your own words, verbatim (optional)</label>
          <textarea
            className={`${inputCls} min-h-24`}
            value={fields.quote ?? ""}
            onChange={(e) => set("quote", e.target.value || null)}
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={fields.revisited ?? false}
              onChange={(e) => set("revisited", e.target.checked || undefined)}
            />
            Been back
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={fields.closed ?? false}
              onChange={(e) => set("closed", e.target.checked || undefined)}
            />
            Permanently closed
          </label>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Needs filling in (optional)</label>
          <textarea
            className={`${inputCls} min-h-16`}
            value={fields.needsCheck ?? ""}
            onChange={(e) => set("needsCheck", e.target.value || undefined)}
            placeholder="An open question about this entry, shown as a callout on the review page."
          />
        </div>
      </section>

      {/* ---- Body ---- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Write-up (one paragraph per box)</p>
          <button
            type="button"
            onClick={addParagraph}
            className="text-sm text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
          >
            + Add paragraph
          </button>
        </div>
        <div className="space-y-3">
          {fields.body.map((p, i) => (
            <div key={i} className="flex gap-3">
              <textarea
                className={`${inputCls} min-h-20 flex-1`}
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeParagraph(i)}
                className="shrink-0 self-start text-sm text-muted hover:text-[#e0554f]"
              >
                Remove
              </button>
            </div>
          ))}
          {fields.body.length === 0 && (
            <p className="text-sm text-muted">No paragraphs yet.</p>
          )}
        </div>
      </section>

      {/* ---- Dishes ---- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Dishes worth noting (optional)</p>
          <button
            type="button"
            onClick={addDish}
            className="text-sm text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
          >
            + Add dish
          </button>
        </div>
        <div className="space-y-3">
          {fields.dishes.map((d, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-line p-3">
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  placeholder="Dish name"
                  value={d.name}
                  onChange={(e) => updateDish(i, { name: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder="Note"
                  value={d.note}
                  onChange={(e) => updateDish(i, { note: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeDish(i)}
                className="shrink-0 self-start text-sm text-muted hover:text-[#e0554f]"
              >
                Remove
              </button>
            </div>
          ))}
          {fields.dishes.length === 0 && (
            <p className="text-sm text-muted">
              None named — leave empty unless you actually named a dish.
            </p>
          )}
        </div>
      </section>

      {/* ---- Tags ---- */}
      <section className="space-y-1.5">
        <label className={labelCls}>Tags (comma-separated)</label>
        <input
          className={inputCls}
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="dinner, trip: Paris 2026, would revisit"
        />
      </section>

      {/* ---- Photos ---- */}
      <section className="space-y-4">
        <p className="eyebrow">Photos</p>

        {mode === "create" && !SLUG_RE.test(slug) && (
          <p className="text-sm text-muted">
            Set a slug above before uploading photos.
          </p>
        )}

        {fields.photos!.length > 0 && (
          <p className="text-xs text-muted">
            The first photo is the cover. Use ← → to reorder; captions are
            optional and double as the image&rsquo;s alt text.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.photos!.map((p, i) => (
            <div
              key={p.url}
              className="space-y-2 rounded-lg border border-line p-2"
            >
              <div className="group relative aspect-[4/3] overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption || ""}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs text-cream opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>

                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-ember">
                    Cover
                  </span>
                )}

                <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(i, -1)}
                    disabled={i === 0}
                    aria-label="Move photo earlier"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(i, 1)}
                    disabled={i === fields.photos!.length - 1}
                    aria-label="Move photo later"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>

              <input
                className={inputCls}
                value={p.caption ?? ""}
                onChange={(e) => setCaption(i, e.target.value)}
                placeholder="Caption (optional)"
              />
            </div>
          ))}

          <label
            className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-center text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream ${
              !SLUG_RE.test(slug) ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {uploading ? (
              <span className="flex items-center gap-1.5">
                <Spinner />
                Uploading…
              </span>
            ) : (
              "+ Add photos"
            )}
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-[#e0554f]/30 bg-[#e0554f]/10 px-4 py-3 text-sm text-[#e0554f]">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-line bg-ink/90 px-6 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.push("/edit")}
          className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-cream"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm font-medium text-ink transition-opacity disabled:opacity-50"
        >
          {saving && <Spinner />}
          {saving ? "Saving…" : mode === "create" ? "Create review" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

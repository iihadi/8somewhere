"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dish, Photo, Review } from "@/data/seed-reviews";
import { TIER_ORDER, TIERS, type Tier } from "@/lib/tiers";
import type { BadgeKey } from "@/lib/badges";
import { parseCuisine, FAMILY_NAMES, UNSPECIFIED } from "@/lib/cuisine";
import type { GeocodeResult } from "@/app/api/edit/geocode/route";
import Stars from "@/components/Stars";
import Spinner from "@/components/Spinner";
import DateField from "./DateField";
import PhotoManager from "./PhotoManager";
import TagInput from "./TagInput";
import VisitCounter from "./VisitCounter";
import BadgePicker from "./BadgePicker";
import { inputCls, labelCls, hintCls } from "./fields";
import { SLUG_RE, slugify } from "@/lib/slug";
import { findPossibleDuplicates, type DuplicateCandidate } from "@/lib/duplicates";

type Mode = "create" | "edit";
type Fields = Omit<Review, "slug">;

const EMPTY: Fields = {
  name: "",
  city: "",
  country: "UK",
  address: null,
  lat: undefined,
  lng: undefined,
  cuisine: "",
  cuisineFamily: undefined,
  visitedAt: null,
  dateApprox: undefined,
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
  visitCount: undefined,
  lastVisitedAt: undefined,
  badges: [],
  needsCheck: undefined,
  draft: true,
};

const PRICES = ["£", "££", "£££", "££££"];

const SECTIONS = [
  { id: "publish", label: "Publish" },
  { id: "identity", label: "Identity" },
  { id: "visits", label: "Visits" },
  { id: "verdict", label: "Verdict" },
  { id: "writeup", label: "Write-up" },
  { id: "dishes", label: "Dishes" },
  { id: "photos", label: "Photos" },
];

function toFields(initial: Review): Fields {
  const { slug: _slug, ...rest } = initial;
  // EMPTY defaults draft to true (new reviews start unpublished) — an
  // existing review being loaded for edit must not inherit that just
  // because its own `draft` key happens to be absent (i.e. published).
  return {
    ...EMPTY,
    ...rest,
    photos: initial.photos ?? [],
    badges: initial.badges ?? [],
    draft: initial.draft ?? undefined,
  };
}

export default function ReviewForm({
  mode,
  initial,
  cuisineSuggestions = [],
  tagSuggestions = [],
  citySuggestions = [],
  existingReviews = [],
}: {
  mode: Mode;
  initial?: Review;
  cuisineSuggestions?: string[];
  tagSuggestions?: string[];
  citySuggestions?: string[];
  existingReviews?: DuplicateCandidate[];
}) {
  const router = useRouter();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [fields, setFields] = useState<Fields>(
    initial ? toFields(initial) : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * The snapshot the form was last known to agree with the server on.
   * Comparing against it is what makes "unsaved changes" honest — a
   * timestamp of the last edit would call an undone change dirty.
   */
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({ slug: initial?.slug ?? "", fields: initial ? toFields(initial) : EMPTY })
  );
  const dirty = JSON.stringify({ slug, fields }) !== baseline;

  const canUpload = SLUG_RE.test(slug);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

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

  function onNameChange(v: string) {
    set("name", v);
    if (mode === "create" && !slugTouched) setSlug(slugify(v));
    setDupesDismissed(false);
  }

  // ---- duplicate detection ----
  const [dupesDismissed, setDupesDismissed] = useState(false);
  const possibleDuplicates = useMemo(
    () =>
      findPossibleDuplicates(
        existingReviews,
        fields.name,
        fields.city,
        mode === "edit" ? initial?.slug : undefined
      ),
    [existingReviews, fields.name, fields.city, mode, initial?.slug]
  );

  // ---- cuisine ----
  const cuisine = useMemo(
    () => parseCuisine(fields.cuisine, fields.cuisineFamily),
    [fields.cuisine, fields.cuisineFamily]
  );

  // ---- dishes ----
  function updateDish(i: number, patch: Partial<Dish>) {
    set(
      "dishes",
      fields.dishes.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    );
  }

  // ---- photos ----
  const onUpload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      if (!SLUG_RE.test(slug)) {
        setError("Set a valid slug before uploading photos.");
        return;
      }
      setUploading(true);
      setError(null);

      for (const file of list) {
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
          setFields((f) => ({ ...f, photos: [...(f.photos ?? []), photo] }));
        } catch (err) {
          setError(
            err instanceof Error
              ? `${file.name}: ${err.message}`
              : `${file.name}: upload failed.`
          );
        }
      }
      setUploading(false);
    },
    [slug]
  );

  /** Removals are best-effort on the storage side — never block on cleanup. */
  function onPhotosChange(next: Photo[]) {
    const removed = (fields.photos ?? []).filter(
      (p) => !next.some((n) => n.url === p.url)
    );
    set("photos", next);
    for (const photo of removed) {
      fetch("/api/edit/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photo.url }),
      }).catch(() => {});
    }
  }

  // ---- save ----
  const save = useCallback(async (overrideDraft?: boolean) => {
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
    const draft = overrideDraft ?? fields.draft;
    const payload = { ...fields, draft, slug };
    if (overrideDraft !== undefined) set("draft", overrideDraft);

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
      // Clear the guard before navigating, or leaving prompts about
      // changes that were in fact just saved.
      setBaseline(JSON.stringify({ slug, fields: { ...fields, draft } }));
      router.push("/edit");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to save.");
    setSaving(false);
  }, [fields, slug, mode, initial, router]);

  // ⌘S / Ctrl+S saves, the way every other editor does.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving && !uploading) void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving, uploading]);

  // Closing the tab mid-edit shouldn't silently bin the write-up.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function onCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    router.push("/edit");
  }

  const visitCount = fields.visitCount ?? (fields.revisited ? 2 : 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-12 pb-28"
    >
      {/* ---- Section jump bar ---- */}
      <nav className="sticky top-0 z-20 -mx-6 flex flex-wrap gap-1 border-b border-line bg-ink/85 px-6 py-3 backdrop-blur-sm">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-cream"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* ---- Publish status ---- */}
      <section id="publish" className="scroll-mt-20">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
            fields.draft
              ? "border-gold/30 bg-gold/[0.06]"
              : "border-ember/25 bg-ember/[0.05]"
          }`}
        >
          <div>
            <p
              className={`eyebrow ${fields.draft ? "text-gold" : "text-ember"}`}
            >
              {fields.draft ? "Draft" : "Published"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {fields.draft
                ? "Only visible here in /edit — hidden from the site, the sitemap, and the RSS feed."
                : "Live on the public site."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => set("draft", fields.draft ? undefined : true)}
            className="rounded-full border border-line px-4 py-2 text-sm text-cream transition-colors hover:border-ember/40"
          >
            {fields.draft ? "Mark as published" : "Unpublish (revert to draft)"}
          </button>
        </div>
      </section>

      {/* ---- Identity ---- */}
      <section id="identity" className="scroll-mt-20 space-y-4">
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

          {!dupesDismissed && possibleDuplicates.length > 0 && (
            <div className="space-y-2 rounded-lg border border-gold/30 bg-gold/[0.06] p-3.5 sm:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-gold">
                  Possibly already logged
                </p>
                <button
                  type="button"
                  onClick={() => setDupesDismissed(true)}
                  className="shrink-0 text-xs text-muted hover:text-cream"
                >
                  Dismiss
                </button>
              </div>
              <ul className="space-y-1.5">
                {possibleDuplicates.map((d) => (
                  <li key={d.slug}>
                    <a
                      href={`/edit/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
                    >
                      {d.name}
                    </a>
                    <span className="ml-2 text-xs text-muted">
                      {d.city} · {Math.round(d.score * 100)}% similar
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
            {mode === "create" && slug && (
              <p className={hintCls}>Will live at /reviews/{slug}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>City</label>
            <input
              className={inputCls}
              list="city-suggestions"
              value={fields.city}
              onChange={(e) => set("city", e.target.value)}
            />
            <datalist id="city-suggestions">
              {citySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
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
                    onClick={() => {
                      set("lat", undefined);
                      set("lng", undefined);
                    }}
                    className="text-xs text-muted hover:text-[#e0554f]"
                  >
                    Remove pin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---- Cuisine, with the family it will be filed under ---- */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>Cuisine</label>
            <input
              className={inputCls}
              list="cuisine-suggestions"
              value={fields.cuisine}
              onChange={(e) => set("cuisine", e.target.value)}
              placeholder="e.g. French tasting menu"
            />
            <datalist id="cuisine-suggestions">
              {Array.from(new Set([...cuisineSuggestions, ...FAMILY_NAMES])).map(
                (c) => (
                  <option key={c} value={c} />
                )
              )}
            </datalist>

            {fields.cuisine.trim() && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={hintCls}>Filed under</span>
                <span className="rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 text-xs text-ember">
                  {cuisine.family}
                </span>
                {cuisine.style && (
                  <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    {cuisine.style}
                  </span>
                )}
                {fields.cuisineFamily ? (
                  <button
                    type="button"
                    onClick={() => set("cuisineFamily", undefined)}
                    className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-cream"
                  >
                    Use the automatic family
                  </button>
                ) : (
                  cuisine.family === UNSPECIFIED && (
                    <span className={hintCls}>
                      Not recognised — set the family below.
                    </span>
                  )
                )}
              </div>
            )}

            <details className="pt-1">
              <summary className="cursor-pointer text-xs text-muted hover:text-cream">
                Override the family
              </summary>
              <div className="mt-2 space-y-1.5">
                <input
                  className={inputCls}
                  list="family-suggestions"
                  value={fields.cuisineFamily ?? ""}
                  onChange={(e) => set("cuisineFamily", e.target.value || undefined)}
                  placeholder="Leave blank to file it automatically"
                />
                <datalist id="family-suggestions">
                  {FAMILY_NAMES.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
                <p className={hintCls}>
                  &ldquo;French tasting menu&rdquo; and &ldquo;Modern
                  French&rdquo; already file themselves under French. Only
                  set this where the guess is wrong.
                </p>
              </div>
            </details>
          </div>

          {/* ---- Price ---- */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelCls}>Price</label>
            <div className="flex flex-wrap gap-2">
              {PRICES.map((p) => {
                const active = fields.price === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("price", active ? null : p)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      active
                        ? "border-cream/40 bg-surface-2 text-cream"
                        : "border-line text-muted hover:text-cream"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              {fields.price && !PRICES.includes(fields.price) && (
                <span className="rounded-full border border-line px-4 py-2 text-sm text-muted">
                  {fields.price}
                </span>
              )}
              {fields.price && (
                <button
                  type="button"
                  onClick={() => set("price", null)}
                  className="rounded-full px-3 py-2 text-xs text-muted underline decoration-line underline-offset-4 hover:text-cream"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Visits ---- */}
      <section id="visits" className="scroll-mt-20 space-y-5">
        <p className="eyebrow">Visits</p>

        <DateField
          label="First visited"
          value={fields.visitedAt}
          approx={fields.dateApprox}
          onChange={(v) => set("visitedAt", v)}
          onApproxChange={(v) => set("dateApprox", v || undefined)}
        />

        <VisitCounter
          count={visitCount}
          onChange={(n) => {
            setFields((f) => ({
              ...f,
              visitCount: n > 1 ? n : undefined,
              revisited: n > 1 ? true : undefined,
              lastVisitedAt: n > 1 ? f.lastVisitedAt : undefined,
            }));
          }}
        />

        {visitCount > 1 && (
          <DateField
            label="Last back"
            value={fields.lastVisitedAt ?? null}
            onChange={(v) => set("lastVisitedAt", v)}
          />
        )}

        <label className="flex items-center gap-2 pt-1 text-sm text-muted">
          <input
            type="checkbox"
            className="accent-[var(--color-ember)]"
            checked={fields.closed ?? false}
            onChange={(e) => set("closed", e.target.checked || undefined)}
          />
          Permanently closed
        </label>
      </section>

      {/* ---- Verdict ---- */}
      <section id="verdict" className="scroll-mt-20 space-y-5">
        <p className="eyebrow">Verdict</p>

        <div className="space-y-1.5">
          <label className={labelCls}>Rating</label>
          <div className="flex flex-wrap gap-2">
            {TIER_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("tier", t)}
                title={TIERS[t].blurb}
                aria-pressed={fields.tier === t}
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
          <p className={hintCls}>{TIERS[fields.tier as Tier].blurb}</p>
        </div>

        <BadgePicker
          selected={fields.badges ?? []}
          onChange={(b: BadgeKey[]) => set("badges", b)}
        />

        <div className="space-y-1.5">
          <label className={labelCls}>Card summary (verdict)</label>
          <input
            className={inputCls}
            value={fields.verdict}
            onChange={(e) => set("verdict", e.target.value)}
            maxLength={160}
          />
          <p className={hintCls}>
            {fields.verdict.length}/160 — this is the line that shows on
            every card and in search results.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Quote — your own words, verbatim (optional)</label>
          <textarea
            className={`${inputCls} min-h-24`}
            value={fields.quote ?? ""}
            onChange={(e) => set("quote", e.target.value || null)}
          />
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

        <div className="space-y-1.5">
          <label className={labelCls}>Tags</label>
          <TagInput
            tags={fields.tags}
            suggestions={tagSuggestions}
            onChange={(t) => set("tags", t)}
          />
        </div>
      </section>

      {/* ---- Body ---- */}
      <section id="writeup" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Write-up (one paragraph per box)</p>
          <button
            type="button"
            onClick={() => set("body", [...fields.body, ""])}
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
                onChange={(e) =>
                  set(
                    "body",
                    fields.body.map((x, idx) => (idx === i ? e.target.value : x))
                  )
                }
              />
              <div className="flex shrink-0 flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...fields.body];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    set("body", next);
                  }}
                  disabled={i === 0}
                  aria-label="Move paragraph up"
                  className="text-xs text-muted hover:text-cream disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (i === fields.body.length - 1) return;
                    const next = [...fields.body];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    set("body", next);
                  }}
                  disabled={i === fields.body.length - 1}
                  aria-label="Move paragraph down"
                  className="text-xs text-muted hover:text-cream disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    set("body", fields.body.filter((_, idx) => idx !== i))
                  }
                  aria-label="Remove paragraph"
                  className="text-xs text-muted hover:text-[#e0554f]"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {fields.body.length === 0 && (
            <p className="text-sm text-muted">No paragraphs yet.</p>
          )}
        </div>
      </section>

      {/* ---- Dishes ---- */}
      <section id="dishes" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Dishes worth noting (optional)</p>
          <button
            type="button"
            onClick={() => set("dishes", [...fields.dishes, { name: "", note: "" }])}
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
                onClick={() =>
                  set("dishes", fields.dishes.filter((_, idx) => idx !== i))
                }
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

      {/* ---- Photos ---- */}
      <section id="photos" className="scroll-mt-20 space-y-4">
        <p className="eyebrow">Photos</p>
        <PhotoManager
          photos={fields.photos ?? []}
          onChange={onPhotosChange}
          onUpload={onUpload}
          uploading={uploading}
          disabled={!canUpload}
          disabledHint="Set a slug above before uploading photos — it decides where they're stored."
        />
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#e0554f]/30 bg-[#e0554f]/10 px-4 py-3 text-sm text-[#e0554f]"
        >
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-ink/90 px-6 py-4 backdrop-blur-sm">
        <span className="mr-auto text-xs text-muted">
          {saving
            ? "Saving…"
            : dirty
              ? "Unsaved changes · ⌘S to save"
              : mode === "edit"
                ? "All changes saved"
                : "Nothing to save yet"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-cream"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || uploading}
          onClick={() => void save(true)}
          className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:text-cream disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          disabled={saving || uploading}
          onClick={() => void save(false)}
          className="flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm font-medium text-ink transition-opacity disabled:opacity-50"
        >
          {saving && <Spinner />}
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Publish review"
              : "Save & publish"}
        </button>
      </div>
    </form>
  );
}

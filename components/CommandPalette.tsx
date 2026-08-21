"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { sortByDate } from "@/lib/derive";
import { searchReviews } from "@/lib/search";
import { placeholderGradient } from "@/lib/photos";
import { usePrefersReducedMotion } from "@/lib/motion";
import Stars from "@/components/Stars";

const PAGES = [
  { href: "/reviews", label: "Reviews" },
  { href: "/map", label: "Map" },
  { href: "/cuisines", label: "Cuisines" },
  { href: "/stats", label: "Stats" },
  { href: "/timeline", label: "Timeline" },
  { href: "/future-destinations", label: "Future destinations" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
];

type Row =
  | { kind: "action"; id: string; label: string; onSelect: () => void }
  | { kind: "page"; href: string; label: string }
  | { kind: "review"; review: Review; snippet?: string };

function isTyping() {
  const active = document.activeElement;
  return (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  );
}

export default function CommandPalette({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  const surpriseMe = useCallback(() => {
    if (reviews.length === 0) return;
    const pick = reviews[Math.floor(Math.random() * reviews.length)];
    router.push(`/reviews/${pick.slug}`);
    close();
  }, [reviews, router, close]);

  // Global open triggers: ⌘K / Ctrl+K, and "/" (folded in from the old
  // SearchShortcut) — both skip when the user is typing somewhere else.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (open || isTyping()) return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const rows: Row[] = useMemo(() => {
    const q = query.trim();

    if (q.length === 0) {
      const recent = sortByDate(reviews)
        .slice(0, 5)
        .map((review): Row => ({ kind: "review", review }));
      return [
        { kind: "action", id: "surprise", label: "🎲 Surprise me", onSelect: surpriseMe },
        ...PAGES.map((p): Row => ({ kind: "page", href: p.href, label: p.label })),
        ...recent,
      ];
    }

    const pageHits = PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())).map(
      (p): Row => ({ kind: "page", href: p.href, label: p.label })
    );
    const reviewHits = searchReviews(reviews, q)
      .slice(0, 8)
      .map((h): Row => ({ kind: "review", review: h.review, snippet: h.snippet }));

    return [...pageHits, ...reviewHits];
  }, [query, reviews, surpriseMe]);

  useEffect(() => setSelected(0), [query, open]);

  function activate(row: Row) {
    if (row.kind === "action") return row.onSelect();
    if (row.kind === "page") {
      router.push(row.href);
      return close();
    }
    router.push(`/reviews/${row.review.slug}`);
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => (rows.length ? (i + 1) % rows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rows[selected]) activate(rows[selected]);
    }
  }

  const trimmed = query.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : undefined}
          onClick={close}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/80 p-4 pt-[15vh] backdrop-blur-md"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="border-b border-line px-4 py-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Command palette search"
                placeholder="Jump to a review, a page, or roll the dice…"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {trimmed.length === 1 && (
                <p className="px-3 py-2 text-xs text-muted">
                  Keep typing — two characters minimum to search reviews.
                </p>
              )}

              {rows.length === 0 && trimmed.length > 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
              )}

              {rows.map((row, i) => {
                const active = i === selected;
                const base = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  active ? "bg-surface-2 text-cream" : "text-muted hover:bg-surface-2/60"
                }`;

                if (row.kind === "action") {
                  return (
                    <button
                      key={row.id}
                      onMouseEnter={() => setSelected(i)}
                      onClick={() => activate(row)}
                      className={base}
                    >
                      {row.label}
                    </button>
                  );
                }
                if (row.kind === "page") {
                  return (
                    <button
                      key={row.href}
                      onMouseEnter={() => setSelected(i)}
                      onClick={() => activate(row)}
                      className={base}
                    >
                      <span className="eyebrow text-[0.6rem] text-muted/70">Page</span>
                      <span className={active ? "text-cream" : ""}>{row.label}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={row.review.slug}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => activate(row)}
                    className={base}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-md bg-cover bg-center"
                      style={{
                        background:
                          row.review.photos?.[0]?.url != null
                            ? `url(${row.review.photos[0].url}) center/cover`
                            : placeholderGradient(row.review.slug),
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${active ? "text-cream" : ""}`}>
                        {row.review.name}
                      </span>
                      <span className="block truncate text-xs text-muted/80">
                        {row.snippet && row.snippet !== row.review.name
                          ? row.snippet
                          : `${row.review.city} · ${row.review.cuisine}`}
                      </span>
                    </span>
                    <Stars tier={row.review.tier} size="sm" />
                  </button>
                );
              })}

              {trimmed.length >= 2 && (
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                    close();
                  }}
                  className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-ember transition-colors hover:bg-surface-2/60"
                >
                  View all results in Search →
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-[0.65rem] uppercase tracking-wider text-muted/70">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

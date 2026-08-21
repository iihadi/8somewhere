"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Review } from "@/data/seed-reviews";
import { placeholderGradient } from "@/lib/photos";
import Stars from "@/components/Stars";

function NeighborCard({
  review,
  direction,
}: {
  review: Review;
  direction: "prev" | "next";
}) {
  const cover = review.photos?.[0] ?? null;
  const align = direction === "next" ? "text-right" : "text-left";
  const arrow = direction === "prev" ? "←" : "→";
  const label = direction === "prev" ? "Newer" : "Older";

  return (
    <Link
      href={`/reviews/${review.slug}`}
      className={`group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ember/40 ${
        direction === "next" ? "flex-row-reverse" : ""
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        {cover ? (
          <Image src={cover.url} alt={review.name} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: placeholderGradient(review.slug) }} />
        )}
      </div>
      <div className={`min-w-0 flex-1 ${align}`}>
        <p className="eyebrow text-muted">
          {direction === "prev" ? `${arrow} ${label}` : `${label} ${arrow}`}
        </p>
        <p className="mt-1 truncate font-display text-lg leading-tight group-hover:text-ember">
          {review.name}
        </p>
        <div className={`mt-1 flex ${direction === "next" ? "justify-end" : ""}`}>
          <Stars tier={review.tier} size="sm" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Steps chronologically between reviews (see chronologicalNeighbors in
 * lib/derive.ts). Also binds Left/Right arrow keys — but Gallery's
 * lightbox and CommandPalette both already set
 * document.body.style.overflow = "hidden" while they're open, so this
 * checks that flag before acting. Without the guard, opening the photo
 * lightbox and pressing → would both advance the photo *and* navigate
 * to the next review.
 */
export default function PrevNextNav({
  prev,
  next,
}: {
  prev: Review | null;
  next: Review | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (document.body.style.overflow === "hidden") return;
      const active = document.activeElement;
      const typing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (typing) return;
      if (e.key === "ArrowLeft" && prev) router.push(`/reviews/${prev.slug}`);
      if (e.key === "ArrowRight" && next) router.push(`/reviews/${next.slug}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  if (!prev && !next) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {prev ? <NeighborCard review={prev} direction="prev" /> : <div />}
      {next ? <NeighborCard review={next} direction="next" /> : <div />}
    </div>
  );
}

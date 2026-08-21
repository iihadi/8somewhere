"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { placeholderGradient } from "@/lib/photos";
import { formatShortDate } from "@/lib/format";
import { returnCount } from "@/lib/derive";
import { usePrefersReducedMotion } from "@/lib/motion";
import { TIERS } from "@/lib/tiers";
import TierBadge from "./TierBadge";
import Badges from "./Badges";
import ClosedBadge from "./ClosedBadge";

export default function ReviewCard({
  review,
  index = 0,
  priority = false,
}: {
  review: Review;
  index?: number;
  priority?: boolean;
}) {
  const cover = review.photos?.[0] ?? null;
  const back = returnCount(review);
  const reduce = usePrefersReducedMotion();
  const accent = TIERS[review.tier].accent;

  // Cursor-reactive spotlight: tracks the pointer via CSS custom
  // properties on the anchor itself (no React re-render per move), so
  // it's cheap even on a dense grid. Real-time pointer tracking isn't
  // the kind of automatic motion prefers-reduced-motion targets, so
  // this stays active regardless of that setting.
  const cardRef = useRef<HTMLAnchorElement>(null);
  function onPointerMove(e: PointerEvent<HTMLAnchorElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.55,
        delay: reduce ? 0 : Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group h-full"
    >
      <Link
        ref={cardRef}
        href={`/reviews/${review.slug}`}
        onPointerMove={onPointerMove}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-500 hover:border-ember/40"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(380px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, ${accent} 22%, transparent), transparent 70%)`,
          }}
        />
        <div className="relative aspect-[4/3] overflow-hidden">
          {cover ? (
            <Image
              src={cover.url}
              alt={review.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              style={{ background: placeholderGradient(review.slug) }}
            >
              <span className="absolute inset-0 grid place-items-center font-display text-6xl text-cream/15">
                {review.name.slice(0, 1)}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-cream backdrop-blur-sm">
              {review.city}
            </span>
            <TierBadge tier={review.tier} size="sm" />
            <Badges badges={review.badges} size="sm" limit={1} />
            {review.closed && <ClosedBadge size="sm" />}
          </div>
        </div>

        <div className="-mt-8 relative flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl leading-tight line-clamp-2">
              {review.name}
            </h3>
            {review.price && (
              <span className="shrink-0 pt-1.5 text-xs text-muted">
                {review.price}
              </span>
            )}
          </div>

          <p className="flex-1 text-sm leading-relaxed text-muted line-clamp-3">
            {review.verdict}
          </p>

          <div className="flex items-end justify-between gap-4 border-t border-line pt-3 text-xs text-muted">
            <span className="min-w-0">
              {review.cuisine}
              {back > 0 && (
                <span className="ml-2 text-ember">
                  · {back + 1}&times; visited
                </span>
              )}
            </span>
            <span className="shrink-0 text-right">
              {review.visitedAt ? formatShortDate(review.visitedAt) : "Undated"}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import { placeholderGradient } from "@/lib/photos";
import { formatShortDate } from "@/lib/format";
import TierBadge from "./TierBadge";

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group h-full"
    >
      <Link
        href={`/reviews/${review.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-500 hover:border-ember/40"
      >
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
            {review.closed && (
              <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-muted backdrop-blur-sm">
                Closed
              </span>
            )}
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
              {review.revisited && (
                <span className="ml-2 text-ember">· been back</span>
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

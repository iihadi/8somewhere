"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import type { SiteStats } from "@/lib/derive";
import { placeholderGradient } from "@/lib/photos";
import { usePrefersReducedMotion } from "@/lib/motion";
import LogoMark from "@/components/LogoMark";
import Brand from "./Brand";

const EXPO = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  hidden: { opacity: 0, y: "60%" },
  show: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: { duration: 0.9, delay: 0.15 + i * 0.1, ease: EXPO },
  }),
};

const lineReduced: Variants = {
  hidden: { opacity: 0, y: "0%" },
  show: { opacity: 1, y: "0%", transition: { duration: 0 } },
};

export default function Hero({
  stats,
  tileReviews,
}: {
  stats: SiteStats;
  tileReviews: Review[];
}) {
  const tiles = tileReviews.slice(0, 8);
  const reduce = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pt-32">
      {/* drifting tile strip — an infinite-repeat animation can still
          visibly thrash even at duration:0, so under reduced motion this
          renders as a plain static row instead of just speeding up. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-16 flex justify-center"
      >
        <motion.div
          className="flex gap-4"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={reduce ? undefined : { duration: 46, repeat: Infinity, ease: "linear" }}
        >
          {(reduce ? tiles : [...tiles, ...tiles]).map((r, i) => {
            const cover = r.photos?.[0] ?? null;
            return (
              <div
                key={`${r.slug}-${i}`}
                className="h-40 w-64 shrink-0 rounded-2xl border border-line bg-cover bg-center"
                style={{
                  backgroundImage: cover
                    ? `url(${cover.url})`
                    : placeholderGradient(r.slug),
                }}
              />
            );
          })}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-16 h-56 bg-gradient-to-b from-transparent via-ink/70 to-ink" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.05 }}
          className="eyebrow"
        >
          A record when I&rsquo;ve
        </motion.p>

        {/*
          The mark replaces the "8" outright rather than sitting beside
          it — it *is* the 8. LogoMark paints it as a mask over the
          ember→gold gradient, so the drawing picks up the brand colour
          instead of staying flat cream. The accessible name lives on
          the <h1>; the drawing itself is decorative.
        */}
        <h1
          aria-label="8somewhere"
          className="mt-6 font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl"
        >
          <span aria-hidden className="block overflow-hidden">
            <motion.span
              custom={0}
              variants={reduce ? lineReduced : line}
              initial="hidden"
              animate="show"
              className="block"
            >
              <Brand />
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {stats.total} restaurants across {stats.cities} cities, ranked by
          whether I&rsquo;d actually go back. Every verdict here is mine, but man am i not a food critic...
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link
            href="/reviews"
            className="rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Read the reviews
          </Link>
          {stats.benchmark && (
            <Link
              href={`/reviews/${stats.benchmark.slug}`}
              className="rounded-full border border-line px-6 py-3 text-sm text-muted transition-colors hover:border-ember/50 hover:text-cream"
            >
              The benchmark: {stats.benchmark.name}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

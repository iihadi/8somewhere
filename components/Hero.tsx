"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { Review } from "@/data/seed-reviews";
import type { SiteStats } from "@/lib/derive";
import { placeholderGradient } from "@/lib/photos";

const EXPO = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  hidden: { opacity: 0, y: "60%" },
  show: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: { duration: 0.9, delay: 0.15 + i * 0.1, ease: EXPO },
  }),
};

export default function Hero({
  stats,
  tileReviews,
}: {
  stats: SiteStats;
  tileReviews: Review[];
}) {
  const tiles = tileReviews.slice(0, 8);

  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pt-32">
      {/* drifting tile strip */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-16 flex justify-center"
      >
        <motion.div
          className="flex gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        >
          {[...tiles, ...tiles].map((r, i) => {
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="eyebrow"
        >
          A running record of everywhere I&rsquo;ve eaten
        </motion.p>

        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
          {["8", "somewhere"].map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                custom={i}
                variants={line}
                initial="hidden"
                animate="show"
                className="block"
              >
                {i === 0 ? (
                  <span className="bg-gradient-to-r from-ember to-gold bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {stats.total} restaurants across {stats.cities} cities, ranked by
          whether I&rsquo;d actually go back. Every verdict here is mine,
          quoted as I wrote it down at the time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
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

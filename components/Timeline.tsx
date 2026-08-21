"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { TimelineGroup } from "@/lib/derive";
import { placeholderGradient } from "@/lib/photos";
import { formatShortDate } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/motion";
import Stars from "@/components/Stars";

export default function Timeline({ groups }: { groups: TimelineGroup[] }) {
  const reduce = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative">
      {/* Spine — a static line, with a motion overlay that draws in as
          the reader scrolls. Under reduced motion the overlay is simply
          omitted; the static line alone still reads fine. */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line sm:left-[13px]" />
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ scaleY: spineScale, transformOrigin: "top" }}
          className="absolute left-[9px] top-2 bottom-2 w-px bg-ember/60 sm:left-[13px]"
        />
      )}

      <div className="space-y-16">
        {groups.map((group) => (
          <section key={group.year} className="relative">
            <h2 className="sticky top-20 z-10 -ml-1 mb-6 inline-block bg-ink pr-4 font-display text-3xl sm:text-4xl">
              {group.year}
            </h2>

            <ul className="space-y-4">
              {group.reviews.map((r, i) => {
                const cover = r.photos?.[0] ?? null;
                return (
                  <motion.li
                    key={r.slug}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.5, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }
                    }
                    className="relative pl-8 sm:pl-10"
                  >
                    <span className="absolute left-[5px] top-4 h-2.5 w-2.5 rounded-full bg-ember ring-4 ring-ink sm:left-[9px]" />
                    <Link
                      href={`/reviews/${r.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ember/40"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        {cover ? (
                          <Image src={cover.url} alt={r.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{ background: placeholderGradient(r.slug) }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="truncate font-display text-lg leading-tight group-hover:text-ember">
                            {r.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {r.visitedAt && formatShortDate(r.visitedAt)} · {r.city}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted">{r.verdict}</p>
                      </div>
                      <Stars tier={r.tier} size="sm" />
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { photosFor, placeholderGradient } from "@/lib/photos";

export default function Gallery({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const photos = photosFor(slug);
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((i) =>
        i === null ? null : (i + dir + photos.length) % photos.length
      ),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  // No photos dropped in yet — show the placeholder rail so the page
  // still reads as finished.
  if (photos.length === 0) {
    return (
      <section className="space-y-4">
        <p className="eyebrow">Photos</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl border border-dashed border-line"
              style={{
                background: placeholderGradient(`${slug}-${i}`),
                opacity: 0.35,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted">
          Drop your Google Photos exports into{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-cream">
            public/photos/{slug}/
          </code>{" "}
          and run <code className="text-cream">npm run photos</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <p className="eyebrow">Photos</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line"
          >
            <Image
              src={p.src}
              alt={`${name} — photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/95 p-4 backdrop-blur-md"
          >
            <motion.div
              key={open}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-4xl"
            >
              <Image
                src={photos[open].src}
                alt={`${name} — photo ${open + 1}`}
                width={photos[open].width}
                height={photos[open].height}
                className="max-h-[85vh] w-full rounded-xl object-contain"
              />
            </motion.div>

            <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-6 text-sm text-muted">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="rounded-full border border-line px-4 py-2 hover:text-cream"
              >
                ←
              </button>
              <span>
                {open + 1} / {photos.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="rounded-full border border-line px-4 py-2 hover:text-cream"
              >
                →
              </button>
            </div>

            <button
              onClick={close}
              className="absolute right-6 top-6 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-cream"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

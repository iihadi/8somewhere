"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo, Video } from "@/data/seed-reviews";
import { placeholderGradient } from "@/lib/photos";
import { usePrefersReducedMotion } from "@/lib/motion";

type GalleryItem =
  | { kind: "photo"; photo: Photo }
  | { kind: "video"; video: Video };

function itemUrl(item: GalleryItem) {
  return item.kind === "photo" ? item.photo.url : item.video.url;
}

function itemCaption(item: GalleryItem) {
  return item.kind === "photo" ? item.photo.caption : item.video.caption;
}

/** m:ss, for the small duration badge on a video tile. */
function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Gallery({
  slug,
  name,
  photos,
  videos = [],
}: {
  slug: string;
  name: string;
  photos: Photo[];
  videos?: Video[];
}) {
  const reduce = usePrefersReducedMotion();
  const items: GalleryItem[] = [
    ...photos.map((photo): GalleryItem => ({ kind: "photo", photo })),
    ...videos.map((video): GalleryItem => ({ kind: "video", video })),
  ];

  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? null : (i + dir + items.length) % items.length)),
    [items.length]
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

  // Nothing uploaded yet — show the placeholder rail so the page still
  // reads as finished.
  if (items.length === 0) {
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
          No photos yet — add some from{" "}
          <a
            href={`/edit/${slug}`}
            className="text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
          >
            the edit page
          </a>
          .
        </p>
      </section>
    );
  }

  const openItem = open !== null ? items[open] : null;

  return (
    <section className="space-y-4">
      <p className="eyebrow">Photos</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const caption = itemCaption(item);
          return (
            <motion.button
              key={itemUrl(item)}
              onClick={() => setOpen(i)}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
              }
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line"
            >
              {item.kind === "photo" ? (
                <Image
                  src={item.photo.url}
                  alt={caption || `${name} — photo ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : item.video.poster ? (
                <Image
                  src={item.video.poster.url}
                  alt={caption || `${name} — video ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: placeholderGradient(`${slug}-video-${i}`) }}
                />
              )}

              {item.kind === "video" && (
                <>
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/35">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-ink/70 backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="translate-x-[1px] text-cream" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  {typeof item.video.duration === "number" && (
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-ink/75 px-1.5 py-0.5 text-[0.65rem] tabular-nums text-cream backdrop-blur-sm">
                      {formatDuration(item.video.duration)}
                    </span>
                  )}
                </>
              )}

              {caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3 pt-8 text-left text-xs leading-snug text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {caption}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {openItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : undefined}
            onClick={close}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/95 p-4 backdrop-blur-md"
          >
            <motion.div
              key={open}
              initial={reduce ? false : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-4xl"
            >
              {openItem.kind === "photo" ? (
                <Image
                  src={openItem.photo.url}
                  alt={openItem.photo.caption || `${name} — photo ${open! + 1}`}
                  width={openItem.photo.width}
                  height={openItem.photo.height}
                  className="max-h-[78vh] w-full rounded-xl object-contain"
                />
              ) : (
                <video
                  key={openItem.video.url}
                  controls
                  playsInline
                  poster={openItem.video.poster?.url}
                  className="max-h-[78vh] w-full rounded-xl bg-ink"
                >
                  <source src={openItem.video.url} type="video/mp4" />
                </video>
              )}
              {itemCaption(openItem) && (
                <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted">
                  {itemCaption(openItem)}
                </p>
              )}
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
                {open! + 1} / {items.length}
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

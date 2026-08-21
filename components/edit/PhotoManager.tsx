"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/data/seed-reviews";
import Spinner from "@/components/Spinner";
import { inputCls, hintCls } from "./fields";

/**
 * Photos are reordered by dragging one card onto another, and added by
 * dropping files anywhere on the grid. The arrow buttons stay: drag
 * and drop is unusable with a keyboard, and position 0 is the cover
 * image, so reordering has to be reachable without a pointer.
 */
export default function PhotoManager({
  photos,
  onChange,
  onUpload,
  uploading,
  disabled,
  disabledHint,
}: {
  photos: Photo[];
  onChange: (next: Photo[]) => void;
  onUpload: (files: FileList | File[]) => void;
  uploading: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [fileOver, setFileOver] = useState(false);
  /** dragenter/dragleave fire per child; count them to avoid flicker. */
  const fileDepth = useRef(0);

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function setCaption(i: number, caption: string) {
    onChange(
      photos.map((p, idx) =>
        idx === i ? { ...p, caption: caption || undefined } : p
      )
    );
  }

  /** A file drag, as opposed to a card being dragged within the grid. */
  function isFileDrag(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types).includes("Files");
  }

  function onGridDragEnter(e: React.DragEvent) {
    if (!isFileDrag(e) || disabled) return;
    fileDepth.current += 1;
    setFileOver(true);
  }

  function onGridDragLeave(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    fileDepth.current = Math.max(0, fileDepth.current - 1);
    if (fileDepth.current === 0) setFileOver(false);
  }

  function onGridDrop(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    fileDepth.current = 0;
    setFileOver(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) onUpload(e.dataTransfer.files);
  }

  return (
    <div
      onDragEnter={onGridDragEnter}
      onDragLeave={onGridDragLeave}
      onDragOver={(e) => isFileDrag(e) && e.preventDefault()}
      onDrop={onGridDrop}
      className={`relative rounded-2xl transition-colors ${
        fileOver ? "bg-ember/[0.06] ring-2 ring-ember/40" : ""
      }`}
    >
      {photos.length > 0 && (
        <p className={`${hintCls} mb-3`}>
          The first photo is the cover. Drag a photo onto another to
          reorder, or use ← → . Captions double as the image&rsquo;s alt
          text.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((p, i) => {
          const isDragging = dragIndex === i;
          const isTarget = overIndex === i && dragIndex !== null && dragIndex !== i;

          return (
            <div
              key={p.url}
              draggable={!disabled}
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
                // Firefox refuses to start a drag without payload.
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverIndex(i);
              }}
              onDrop={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                e.stopPropagation();
                move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`space-y-2 rounded-lg border p-2 transition-all ${
                isTarget
                  ? "border-ember/60 bg-ember/[0.06]"
                  : "border-line"
              } ${isDragging ? "opacity-40" : ""} ${
                disabled ? "" : "cursor-grab active:cursor-grabbing"
              }`}
            >
              <div className="group relative aspect-[4/3] overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption || ""}
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs text-cream opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Remove
                </button>

                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted">
                  {i === 0 ? <span className="text-ember">Cover</span> : i + 1}
                </span>

                <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move photo earlier"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === photos.length - 1}
                    aria-label="Move photo later"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    →
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => move(i, 0)}
                      className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream"
                    >
                      Make cover
                    </button>
                  )}
                </div>
              </div>

              <input
                className={inputCls}
                value={p.caption ?? ""}
                onChange={(e) => setCaption(i, e.target.value)}
                placeholder="Caption (optional)"
              />
            </div>
          );
        })}

        <label
          className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line text-center text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream ${
            disabled ? "pointer-events-none opacity-40" : ""
          }`}
        >
          {uploading ? (
            <span className="flex items-center gap-1.5">
              <Spinner />
              Uploading…
            </span>
          ) : (
            <>
              <span className="font-display text-2xl leading-none">+</span>
              <span>Add photos</span>
              <span className="px-4 text-[0.65rem] text-muted/70">
                or drop them anywhere here
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onUpload(e.target.files);
              // Reset so re-picking the same file fires onChange again.
              e.target.value = "";
            }}
            disabled={uploading || disabled}
          />
        </label>
      </div>

      {disabled && disabledHint && (
        <p className={`${hintCls} mt-3`}>{disabledHint}</p>
      )}
    </div>
  );
}

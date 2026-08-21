"use client";

import { useRef, useState } from "react";
import type { Video } from "@/data/seed-reviews";
import Spinner from "@/components/Spinner";
import { inputCls, hintCls } from "./fields";

function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Sibling of PhotoManager, same reorder/caption/remove pattern — clips
 * just don't have a "cover" slot (photos already own that), so there's
 * no "make cover" button.
 */
export default function VideoManager({
  videos,
  onChange,
  onUpload,
  uploading,
  disabled,
  disabledHint,
}: {
  videos: Video[];
  onChange: (next: Video[]) => void;
  onUpload: (files: FileList | File[]) => void;
  uploading: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [fileOver, setFileOver] = useState(false);
  const fileDepth = useRef(0);

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= videos.length) return;
    const next = [...videos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function setCaption(i: number, caption: string) {
    onChange(
      videos.map((v, idx) => (idx === i ? { ...v, caption: caption || undefined } : v))
    );
  }

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
      {videos.length > 0 && (
        <p className={`${hintCls} mb-3`}>
          Clips play after the photos in the gallery. Drag one onto another
          to reorder, or use ← → .
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {videos.map((v, i) => {
          const isDragging = dragIndex === i;
          const isTarget = overIndex === i && dragIndex !== null && dragIndex !== i;

          return (
            <div
              key={v.url}
              draggable={!disabled}
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
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
                isTarget ? "border-ember/60 bg-ember/[0.06]" : "border-line"
              } ${isDragging ? "opacity-40" : ""} ${
                disabled ? "" : "cursor-grab active:cursor-grabbing"
              }`}
            >
              <div className="group relative aspect-[4/3] overflow-hidden rounded-md bg-surface-2">
                {v.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.poster.url}
                    alt={v.caption || ""}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={v.url}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover"
                    muted
                    playsInline
                  />
                )}

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/70">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="translate-x-[1px] text-cream" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>

                {typeof v.duration === "number" && (
                  <span className="absolute bottom-1.5 right-1.5 rounded-md bg-ink/85 px-1.5 py-0.5 text-[0.6rem] tabular-nums text-cream">
                    {formatDuration(v.duration)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onChange(videos.filter((_, idx) => idx !== i))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs text-cream opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Remove
                </button>

                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted">
                  {i + 1}
                </span>

                <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move video earlier"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === videos.length - 1}
                    aria-label="Move video later"
                    className="rounded-full bg-ink/85 px-2 py-1 text-xs text-cream disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>

              <input
                className={inputCls}
                value={v.caption ?? ""}
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
              <span>Add a clip</span>
              <span className="px-4 text-[0.65rem] text-muted/70">
                .mp4 or .mov, or drop one here
              </span>
            </>
          )}
          <input
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onUpload(e.target.files);
              e.target.value = "";
            }}
            disabled={uploading || disabled}
          />
        </label>
      </div>

      {disabled && disabledHint && <p className={`${hintCls} mt-3`}>{disabledHint}</p>}
    </div>
  );
}

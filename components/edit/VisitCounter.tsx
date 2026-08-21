"use client";

import { hintCls, labelCls } from "./fields";

/**
 * How many times I've been, not just whether I've been back. One is
 * the floor — a review exists because a visit happened.
 */
export default function VisitCounter({
  count,
  onChange,
}: {
  count: number;
  onChange: (next: number) => void;
}) {
  const back = count - 1;
  const summary =
    back <= 0
      ? "First and only visit so far."
      : back === 1
        ? "Been back once."
        : `Been back ${back} times.`;

  return (
    <div className="space-y-2">
      <label className={labelCls}>Times visited</label>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-surface">
          <button
            type="button"
            aria-label="One fewer visit"
            disabled={count <= 1}
            onClick={() => onChange(Math.max(1, count - 1))}
            className="grid h-10 w-10 place-items-center rounded-l-full text-lg text-muted transition-colors hover:text-cream disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={count}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange(Number.isFinite(n) ? Math.min(999, Math.max(1, Math.floor(n))) : 1);
            }}
            aria-label="Times visited"
            className="w-14 border-x border-line bg-transparent py-2.5 text-center font-display text-lg outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="One more visit"
            onClick={() => onChange(Math.min(999, count + 1))}
            className="grid h-10 w-10 place-items-center rounded-r-full text-lg text-muted transition-colors hover:text-cream"
          >
            +
          </button>
        </div>

        <span className={hintCls}>{summary}</span>
      </div>
    </div>
  );
}

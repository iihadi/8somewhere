"use client";

import { useState } from "react";
import { inputCls, hintCls } from "./fields";

/**
 * `visitedAt` is stored as either a plain `YYYY-MM-DD` (ledger dates)
 * or a full ISO timestamp with an offset (calendar bookings). Typing
 * either by hand is miserable, so this splits the stored string into a
 * native date picker plus an optional time, and recomposes it — while
 * still letting the raw string be edited directly for the odd entry
 * whose offset matters.
 */

function splitISO(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  return { date: iso.slice(0, 10), time: iso.length > 10 ? iso.slice(11, 16) : "" };
}

/**
 * Recombines without going through `Date` — the stored string is a
 * local wall-clock date and must never be shifted by the server's
 * timezone, which is exactly what `new Date(...).toISOString()` does.
 */
function joinISO(date: string, time: string): string | null {
  if (!date) return null;
  return time ? `${date}T${time}:00` : date;
}

function todayLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function DateField({
  value,
  approx,
  onChange,
  onApproxChange,
  label = "Visited",
}: {
  value: string | null;
  approx?: boolean;
  onChange: (next: string | null) => void;
  onApproxChange?: (next: boolean) => void;
  label?: string;
}) {
  const { date, time } = splitISO(value);
  const [raw, setRaw] = useState(false);

  /** True when the stored string carries an offset the pickers would drop. */
  const hasOffset = Boolean(value && /[+-]\d{2}:\d{2}$|Z$/.test(value));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs uppercase tracking-wider text-muted">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setRaw((r) => !r)}
          className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-cream"
        >
          {raw ? "Use the picker" : "Edit the raw value"}
        </button>
      </div>

      {raw ? (
        <input
          className={inputCls}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="2026-09-01 or 2026-09-01T19:30:00+01:00"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            className={`${inputCls} w-auto flex-1 [color-scheme:dark]`}
            value={date}
            max="2100-12-31"
            onChange={(e) => onChange(joinISO(e.target.value, time))}
          />
          <input
            type="time"
            className={`${inputCls} w-auto [color-scheme:dark]`}
            value={time}
            disabled={!date}
            onChange={(e) => onChange(joinISO(date, e.target.value))}
          />
          <button
            type="button"
            onClick={() => onChange(joinISO(todayLocal(), time))}
            className="rounded-full border border-line px-3 py-2 text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream"
          >
            Today
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-line px-3 py-2 text-xs text-muted transition-colors hover:border-[#e0554f]/40 hover:text-[#e0554f]"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {hasOffset && !raw && (
        <p className={hintCls}>
          This entry stores a timezone offset. Editing it with the picker
          keeps the date and time but drops the offset — use the raw value
          if that matters.
        </p>
      )}

      {onApproxChange && (
        <label className="flex items-center gap-2 pt-1 text-sm text-muted">
          <input
            type="checkbox"
            className="accent-[var(--color-ember)]"
            checked={approx ?? false}
            onChange={(e) => onApproxChange(e.target.checked)}
          />
          Date is a best guess, not a confirmed booking
        </label>
      )}
    </div>
  );
}

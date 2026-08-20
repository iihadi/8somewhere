"use client";

import { BADGES, BADGE_ORDER, type BadgeKey } from "@/lib/badges";
import { hintCls, labelCls } from "./fields";

/**
 * The stars say how good it was; the badges say what to do about it.
 * Multi-select on purpose — "Hidden gem" and "Cheap thrill" are often
 * the same place.
 */
export default function BadgePicker({
  selected,
  onChange,
}: {
  selected: BadgeKey[];
  onChange: (next: BadgeKey[]) => void;
}) {
  function toggle(b: BadgeKey) {
    const next = selected.includes(b)
      ? selected.filter((x) => x !== b)
      : [...selected, b];
    onChange(BADGE_ORDER.filter((x) => next.includes(x)));
  }

  return (
    <div className="space-y-2">
      <label className={labelCls}>Badges</label>
      <p className={hintCls}>
        Shown next to the stars. Pick as many as fit — or none.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {BADGE_ORDER.map((b) => {
          const active = selected.includes(b);
          const { label, blurb, accent } = BADGES[b];
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              title={blurb}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                active ? "" : "border-line text-muted hover:text-cream"
              }`}
              style={
                active
                  ? {
                      color: accent,
                      borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                      backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
                    }
                  : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { inputCls, hintCls } from "./fields";

/**
 * Tags as chips rather than one comma-separated string: a stray comma
 * used to silently create a tag called "" and typos were invisible
 * until they showed up on the live site as a one-entry tag.
 */
export default function TagInput({
  tags,
  suggestions = [],
  onChange,
}: {
  tags: string[];
  suggestions?: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const value = raw.trim().replace(/,+$/, "").trim();
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...tags, value]);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (!draft.trim()) return;
      e.preventDefault();
      add(draft);
      return;
    }
    // Backspace on an empty box removes the last chip.
    if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  const unused = suggestions
    .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
    .slice(0, 12);

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-1.5 text-xs">
                {t}
                <button
                  type="button"
                  aria-label={`Remove tag ${t}`}
                  onClick={() => onChange(tags.filter((x) => x !== t))}
                  className="grid h-4 w-4 place-items-center rounded-full text-muted transition-colors hover:bg-[#e0554f]/20 hover:text-[#e0554f]"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        className={inputCls}
        value={draft}
        onChange={(e) => {
          // Pasting "a, b, c" should become three chips, not one.
          if (e.target.value.includes(",")) {
            const parts = e.target.value.split(",");
            const last = parts.pop() ?? "";
            parts.forEach(add);
            setDraft(last);
            return;
          }
          setDraft(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder="Type a tag and press Enter — e.g. trip: Paris 2026"
      />

      {unused.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={hintCls}>Used before:</span>
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-ember/40 hover:text-cream"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

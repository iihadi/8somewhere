import { BADGES, type BadgeKey } from "@/lib/badges";

/**
 * Badge pills, coloured from the badge's own accent. Rendered next to
 * the stars, never in place of them — a badge answers "would I go
 * back", the stars answer "was it any good".
 */
export default function Badges({
  badges,
  size = "md",
  limit,
}: {
  badges?: BadgeKey[];
  size?: "sm" | "md";
  limit?: number;
}) {
  const list = badges ?? [];
  if (list.length === 0) return null;

  const shown = limit ? list.slice(0, limit) : list;
  const hidden = list.length - shown.length;
  const pad = size === "sm" ? "px-2.5 py-1 text-[0.65rem]" : "px-3 py-1 text-xs";

  return (
    <>
      {shown.map((b) => {
        const { label, blurb, accent } = BADGES[b];
        return (
          <span
            key={b}
            title={blurb}
            className={`inline-flex shrink-0 items-center rounded-full border uppercase tracking-wider ${pad}`}
            style={{
              color: accent,
              borderColor: `color-mix(in oklab, ${accent} 35%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
            }}
          >
            {label}
          </span>
        );
      })}
      {hidden > 0 && (
        <span
          className={`inline-flex shrink-0 items-center rounded-full border border-line uppercase tracking-wider text-muted ${pad}`}
        >
          +{hidden}
        </span>
      )}
    </>
  );
}

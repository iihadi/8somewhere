/**
 * "Now closed" reads as a warning, not a neutral fact — you'd otherwise
 * turn up somewhere that no longer exists. Uses the same red as the
 * "avoid" tier accent, deliberately louder than the muted-grey pills
 * everything else on a card uses.
 */
export default function ClosedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-[0.65rem]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e0554f]/40 bg-[#e0554f]/12 uppercase tracking-wider text-[#e0554f] ${pad}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e0554f]" />
      Now closed
    </span>
  );
}

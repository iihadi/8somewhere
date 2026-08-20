export default function Rating({
  value,
  size = "md",
}: {
  value: number;
  /** md = card, lg = review header */
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  const text =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-base" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <span className={`font-display leading-none ${text}`}>
        {value.toFixed(1)}
        <span className="text-muted text-[0.5em] align-super ml-0.5">/10</span>
      </span>
      {size !== "sm" && (
        <span className="h-1 w-16 overflow-hidden rounded-full bg-surface-2">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-ember to-gold"
            style={{ width: `${pct}%` }}
          />
        </span>
      )}
    </div>
  );
}

import Link from "next/link";

/**
 * One horizontal bar in a stats breakdown. Plain CSS widths rather
 * than a charting library — the whole stats page is a handful of
 * proportional bars and doesn't justify the bundle.
 */
export default function BarRow({
  label,
  count,
  max,
  accent = "var(--color-ember)",
  href,
  sublabel,
}: {
  label: React.ReactNode;
  count: number;
  max: number;
  accent?: string;
  href?: string;
  sublabel?: string;
}) {
  const pct = max > 0 ? Math.max((count / max) * 100, 2) : 0;

  const inner = (
    <>
      <span className="flex items-baseline justify-between gap-4">
        <span className="min-w-0 truncate text-sm">{label}</span>
        <span className="shrink-0 text-sm tabular-nums text-muted">
          {count}
          {sublabel && <span className="ml-1.5 text-xs">{sublabel}</span>}
        </span>
      </span>
      <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <span
          className="block h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: accent }}
        />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-lg px-1 py-2 transition-colors hover:bg-surface-2">
        {inner}
      </Link>
    );
  }
  return <div className="px-1 py-2">{inner}</div>;
}

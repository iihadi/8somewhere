/**
 * The subcategory within a cuisine family — "Bistro" under French,
 * "Tasting menu" under Japanese. Distinct from the family pill (which
 * groups the whole /cuisines section): this one rides alongside a
 * single restaurant to say what kind of French/Japanese/etc it is.
 */
export default function StylePill({
  children,
  size = "sm",
}: {
  children: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-[0.7rem]" : "px-3 py-1.5 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-gold/30 bg-gold/10 text-gold ${pad}`}
    >
      {children}
    </span>
  );
}

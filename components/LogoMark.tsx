/**
 * The hand-drawn mark, painted as a mask over the ember→gold gradient
 * instead of shown as its raw black-square PNG — the version Hero.tsx
 * originally used only for the homepage "8". Used everywhere the mark
 * appears so the logo reads as the brand colour sitewide rather than a
 * flat black tile.
 */
export default function LogoMark({
  className = "",
  position = "center",
}: {
  className?: string;
  position?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-gradient-to-br from-ember to-gold ${className}`}
      style={{
        WebkitMaskImage: "url(/logo-mark.png)",
        maskImage: "url(/logo-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: position,
        maskPosition: position,
      }}
    />
  );
}

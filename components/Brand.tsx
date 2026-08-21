import LogoMark from "./LogoMark";

/** The site name, styled consistently everywhere it appears. */
export default function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <LogoMark
        className="-ml-[0.06em] h-[1.55em] w-[1.6em] drop-shadow-[0_0_38px_rgba(255,138,61,0.28)]"
        position="left bottom"
      /><span className="italic">somewhere</span>
    </span>
  );
}

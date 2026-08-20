/** The site name, styled consistently everywhere it appears. */
export default function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      8<span className="italic">somewhere</span>
    </span>
  );
}

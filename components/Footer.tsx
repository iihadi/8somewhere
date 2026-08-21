import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export default function Footer({
  total,
  cities,
}: {
  total: number;
  cities: number;
}) {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl"><LogoMark
            className="-ml-[0.06em] h-[1.55em] w-[1.6em] drop-shadow-[0_0_38px_rgba(255,138,61,0.28)]"
            position="left bottom"
          />somewhere</p>
          <p className="mt-1.5 max-w-sm text-sm text-muted">
            An aggregate of my dining experiences. Made in Next.js and hosted on Vercel.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/reviews" className="hover:text-cream transition-colors">
            Reviews
          </Link>
          <Link href="/map" className="hover:text-cream transition-colors">
            Map
          </Link>
          <Link href="/cuisines" className="hover:text-cream transition-colors">
            Cuisines
          </Link>
          <Link href="/stats" className="hover:text-cream transition-colors">
            Stats
          </Link>
          <Link href="/timeline" className="hover:text-cream transition-colors">
            Timeline
          </Link>
          <Link href="/future-destinations" className="hover:text-cream transition-colors">
            Future destinations
          </Link>
          <Link href="/about" className="hover:text-cream transition-colors">
            About
          </Link>
          <a href="/feed.xml" className="hover:text-cream transition-colors">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}

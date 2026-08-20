import Link from "next/link";
import Brand from "@/components/Brand";

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
          <p className="font-display text-2xl"><Brand /></p>
          <p className="mt-1.5 max-w-sm text-sm text-muted">
            {total} meals across {cities} cities. Dates pulled from a
            calendar I should probably clean up.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/reviews" className="hover:text-cream transition-colors">
            Reviews
          </Link>
          <Link href="/wishlist" className="hover:text-cream transition-colors">
            Wishlist
          </Link>
          <Link href="/about" className="hover:text-cream transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}

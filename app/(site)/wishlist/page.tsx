import type { Metadata } from "next";
import { wishlist } from "@/data/seed-reviews";
import { formatDate } from "@/lib/format";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Booked, planned, or just sitting on the list.",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">Not yet</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Wishlist</h1>
        <p className="mt-4 text-muted">
          Booked, planned, or just sitting there waiting for a free
          weekend and a functioning bank balance.
        </p>
      </Reveal>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {wishlist.map((w, i) => (
          <Reveal key={w.name} delay={i * 0.06}>
            <li className="px-6 py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl">{w.name}</h2>
                <span className="text-sm text-muted">{w.city}</span>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{w.note}</p>
              {w.plannedFor && (
                <p className="mt-4 inline-flex rounded-full border border-ember/30 bg-ember/10 px-3 py-1.5 text-xs text-ember">
                  Planned for {formatDate(w.plannedFor)}
                </p>
              )}
            </li>
          </Reveal>
        ))}
      </ul>

      {wishlist.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          Nothing on the list. Suspicious.
        </p>
      )}
    </div>
  );
}

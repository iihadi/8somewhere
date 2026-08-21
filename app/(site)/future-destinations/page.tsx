import type { Metadata } from "next";
import { getWishlist } from "@/lib/repo";
import Reveal from "@/components/Reveal";
import StylePill from "@/components/StylePill";

export const metadata: Metadata = {
  title: "Future destinations",
  description: "Where I'm going next — booked, planned, or just on the list.",
};

export const dynamic = "force-dynamic";

export default async function FutureDestinationsPage() {
  const destinations = await getWishlist();

  return (
    <div className="mx-auto max-w-3xl px-6 pt-20">
      <Reveal className="mb-12">
        <p className="eyebrow">Not yet</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          Future destinations
        </h1>
        <p className="mt-4 text-muted">
          Booked, planned, or just sitting there waiting for a free
          weekend and a functioning bank balance.
        </p>
      </Reveal>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {destinations.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.06}>
            <li className="px-6 py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl">{d.name}</h2>
                <span className="text-sm text-muted">{d.city}</span>
              </div>
              {d.cuisine && (
                <p className="mt-3">
                  <StylePill size="md">{d.cuisine}</StylePill>
                </p>
              )}
              <p className="mt-3 leading-relaxed text-muted">{d.note}</p>
            </li>
          </Reveal>
        ))}
      </ul>

      {destinations.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          Nothing on the list. Suspicious.
        </p>
      )}
    </div>
  );
}

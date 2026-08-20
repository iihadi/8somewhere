import type { Metadata } from "next";
import { stats, cities } from "@/data/reviews";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "What this site is and how the ratings work.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-20">
      <Reveal className="space-y-6">
        <p className="eyebrow">About</p>
        <h1 className="font-display text-5xl sm:text-6xl">
          Why this exists
        </h1>

        <p className="text-xl leading-[1.8]">
          I kept forgetting what I ate and where. This is the fix — every
          restaurant booking that made it into my calendar, written up
          properly, with photos and a number at the end.
        </p>

        <p className="leading-[1.85] text-cream/80">
          So far that&rsquo;s {stats.total} places across{" "}
          {cities.join(", ")}. The average score is{" "}
          {stats.average.toFixed(1)}, which is either evidence of good
          taste or of grade inflation. Probably both.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-16 space-y-4">
        <p className="eyebrow">How the scoring works</p>
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
          {[
            ["9.0 – 10", "Would rearrange a weekend around it."],
            ["8.0 – 8.9", "Excellent. Actively recommending it to people."],
            ["7.0 – 7.9", "Good. Happy to go back if someone else picks."],
            ["6.0 – 6.9", "Fine. Nothing wrong, nothing memorable."],
            ["Below 6", "Something went wrong, and I’ll say what."],
          ].map(([band, meaning]) => (
            <div key={band} className="flex gap-6 px-6 py-4">
              <dt className="w-24 shrink-0 font-display text-lg">{band}</dt>
              <dd className="text-muted">{meaning}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.15} className="mt-16 space-y-4">
        <p className="eyebrow">The fine print</p>
        <p className="leading-[1.85] text-cream/80">
          Everything here is paid for out of my own pocket. Dates and
          addresses are pulled from the original booking, so if a place has
          moved since, the review reflects where it was on the night.
        </p>
      </Reveal>
    </div>
  );
}

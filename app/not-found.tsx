import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl">Nothing on this table</h1>
        <p className="mt-4 text-muted">
          That review doesn&rsquo;t exist — or it hasn&rsquo;t been written up yet.
        </p>
        <Link
          href="/reviews"
          className="mt-8 inline-block rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          Browse the reviews
        </Link>
      </div>
    </div>
  );
}

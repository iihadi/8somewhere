import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { sortByDate } from "@/lib/derive";
import { formatShortDate } from "@/lib/format";
import Stars from "@/components/Stars";
import LogoutButton from "@/components/edit/LogoutButton";
import DeleteReviewButton from "@/components/edit/DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function EditDashboard() {
  const reviews = sortByDate(await getAllReviews());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl">
            {reviews.length} restaurants
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/edit/new"
            className="rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink"
          >
            + New review
          </Link>
          <LogoutButton />
        </div>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {reviews.map((r) => (
          <li
            key={r.slug}
            className="flex flex-wrap items-center gap-4 px-5 py-4"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {r.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photos[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg">{r.name}</p>
              <p className="truncate text-xs text-muted">
                {r.city} · {r.cuisine}
                {r.visitedAt && ` · ${formatShortDate(r.visitedAt)}`}
              </p>
            </div>

            <Stars tier={r.tier} size="sm" />

            <div className="flex shrink-0 items-center gap-4">
              <Link
                href={`/edit/${r.slug}`}
                className="text-sm text-cream underline decoration-line underline-offset-4 hover:decoration-ember"
              >
                Edit
              </Link>
              <DeleteReviewButton slug={r.slug} name={r.name} />
            </div>
          </li>
        ))}
      </ul>

      {reviews.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
          No reviews yet.
        </p>
      )}
    </div>
  );
}

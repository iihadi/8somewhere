import Link from "next/link";
import { getAllReviews } from "@/lib/repo";
import { sortByDate } from "@/lib/derive";
import LogoutButton from "@/components/edit/LogoutButton";
import DashboardTable from "@/components/edit/DashboardTable";

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
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/edit/export?format=json"
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-cream"
          >
            Export JSON
          </a>
          <a
            href="/api/edit/export?format=csv"
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-cream"
          >
            Export CSV
          </a>
          <Link
            href="/edit/new"
            className="rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink"
          >
            + New review
          </Link>
          <LogoutButton />
        </div>
      </div>

      <DashboardTable reviews={reviews} />
    </div>
  );
}

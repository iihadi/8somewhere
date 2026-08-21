import { NextResponse } from "next/server";
import type { Review } from "@/data/seed-reviews";
import { sanitiseBadges } from "@/lib/badges";
import { deleteReview, updateReview } from "@/lib/repo";
import { deleteImage } from "@/lib/storage";

type Params = { params: Promise<{ slug: string }> };

/**
 * `visitCount` is the single source of truth; `revisited` is written
 * alongside it so entries stay readable to anything still checking the
 * old flag. A count below 2 means neither is set.
 */
function normaliseVisits(body: Partial<Review>): number {
  const raw = Number(body.visitCount);
  if (Number.isFinite(raw) && raw >= 1) return Math.min(Math.floor(raw), 999);
  return body.revisited ? 2 : 1;
}

export async function PUT(req: Request, { params }: Params) {
  const { slug } = await params;

  let body: Partial<Review>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const visits = normaliseVisits(body);

  const patch: Omit<Review, "slug"> = {
    name: body.name.trim(),
    city: body.city?.trim() || "",
    country: body.country?.trim() || "",
    address: body.address?.trim() || null,
    lat: typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined,
    lng: typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : undefined,
    cuisine: body.cuisine?.trim() || "",
    cuisineFamily: body.cuisineFamily?.trim() || undefined,
    visitedAt: body.visitedAt?.trim() || null,
    dateApprox: body.dateApprox ? true : undefined,
    price: body.price?.trim() || null,
    tier: body.tier ?? "unlogged",
    quote: body.quote?.trim() || null,
    verdict: body.verdict?.trim() || "",
    dishes: body.dishes ?? [],
    body: body.body ?? [],
    tags: body.tags ?? [],
    photos: body.photos ?? [],
    closed: body.closed ?? undefined,
    revisited: visits > 1 ? true : undefined,
    visitCount: visits > 1 ? visits : undefined,
    lastVisitedAt:
      visits > 1 ? body.lastVisitedAt?.trim() || undefined : undefined,
    badges: sanitiseBadges(body.badges),
    draft: body.draft ? true : undefined,
    needsCheck: body.needsCheck?.trim() || undefined,
  };

  try {
    const updated = await updateReview(slug, patch);
    return NextResponse.json({ ok: true, review: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update review." },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params;

  try {
    // Best-effort cleanup of the review's images. Never block the
    // review deletion on a storage hiccup — an orphaned blob costs
    // nothing but a few KB.
    const { getReview } = await import("@/lib/repo");
    const review = await getReview(slug);
    if (review?.photos?.length) {
      await Promise.allSettled(review.photos.map((p) => deleteImage(p.url)));
    }
    await deleteReview(slug);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete review." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import type { Review } from "@/data/seed-reviews";
import { deleteReview, updateReview } from "@/lib/repo";
import { deleteImage } from "@/lib/storage";

type Params = { params: Promise<{ slug: string }> };

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

  const patch: Omit<Review, "slug"> = {
    name: body.name.trim(),
    city: body.city?.trim() || "",
    country: body.country?.trim() || "",
    address: body.address?.trim() || null,
    lat: typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined,
    lng: typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : undefined,
    cuisine: body.cuisine?.trim() || "",
    visitedAt: body.visitedAt?.trim() || null,
    price: body.price?.trim() || null,
    tier: body.tier ?? "unlogged",
    quote: body.quote?.trim() || null,
    verdict: body.verdict?.trim() || "",
    dishes: body.dishes ?? [],
    body: body.body ?? [],
    tags: body.tags ?? [],
    photos: body.photos ?? [],
    closed: body.closed ?? undefined,
    revisited: body.revisited ?? undefined,
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

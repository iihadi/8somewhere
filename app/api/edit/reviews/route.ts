import { NextResponse } from "next/server";
import type { Review } from "@/data/seed-reviews";
import { createReview } from "@/lib/repo";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function POST(req: Request) {
  let body: Partial<Review>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers and hyphens only." },
      { status: 400 }
    );
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const review: Review = {
    slug,
    name: body.name.trim(),
    city: body.city?.trim() || "",
    country: body.country?.trim() || "",
    address: body.address?.trim() || null,
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
    await createReview(review);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create review." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, slug: review.slug });
}

import { NextResponse } from "next/server";
import type { Review } from "@/data/seed-reviews";
import { sanitiseBadges } from "@/lib/badges";
import { createReview } from "@/lib/repo";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

  const visits = normaliseVisits(body);

  const review: Review = {
    slug,
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

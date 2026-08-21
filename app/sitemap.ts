import type { MetadataRoute } from "next";
import { getAllReviews } from "@/lib/repo";
import { publishedOnly } from "@/lib/derive";

// Set this to your real domain once Vercel gives you one.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reviews = publishedOnly(await getAllReviews());

  const staticRoutes = [
    "",
    "/reviews",
    "/map",
    "/cuisines",
    "/stats",
    "/wishlist",
    "/search",
    "/about",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));

  const reviewRoutes = reviews.map((r) => ({
    url: `${BASE}/reviews/${r.slug}`,
    lastModified: r.visitedAt ? new Date(r.visitedAt) : new Date(),
  }));

  return [...staticRoutes, ...reviewRoutes];
}

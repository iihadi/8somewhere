import type { MetadataRoute } from "next";
import { reviews } from "@/data/reviews";

// Set this to your real domain once Vercel gives you one.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/reviews", "/wishlist", "/about"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));

  const reviewRoutes = reviews.map((r) => ({
    url: `${BASE}/reviews/${r.slug}`,
    lastModified: new Date(r.visitedAt),
  }));

  return [...staticRoutes, ...reviewRoutes];
}

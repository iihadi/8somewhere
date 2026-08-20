import { getAllReviews } from "@/lib/repo";
import { sortByDate } from "@/lib/derive";
import { TIERS } from "@/lib/tiers";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";

export const dynamic = "force-dynamic";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const reviews = sortByDate(await getAllReviews()).slice(0, 50);

  const items = reviews
    .map((r) => {
      const stars = TIERS[r.tier].stars;
      const rating = stars === null ? "Not yet rated" : `${stars}/3 stars`;
      const description = [r.verdict, `— ${rating}`, ...(r.body ?? [])].join("\n\n");
      // Undated entries still need a valid pubDate; fall back to now.
      const date = r.visitedAt ? new Date(r.visitedAt) : new Date();

      return `    <item>
      <title>${esc(r.name)}</title>
      <link>${BASE}/reviews/${r.slug}</link>
      <guid isPermaLink="true">${BASE}/reviews/${r.slug}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <category>${esc(r.cuisine)}</category>
      <description>${esc(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>8somewhere</title>
    <link>${BASE}</link>
    <description>Every restaurant I've eaten at, written up honestly.</description>
    <language>en-GB</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=600",
    },
  });
}

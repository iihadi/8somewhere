import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getReview } from "@/lib/repo";
import { buildShareCard, SHARE_CARD_SIZE } from "@/lib/shareCard";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ slug: string }> };

/**
 * The same card as opengraph-image.tsx, but served with
 * Content-Disposition: attachment so a click from the review page
 * downloads a file instead of just displaying inline — the button on
 * the page points here, not at the OG image route.
 */
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const review = await getReview(slug);
  if (!review || review.draft) notFound();

  const image = new ImageResponse(buildShareCard(review), SHARE_CARD_SIZE);
  const buffer = await image.arrayBuffer();
  const filename = `8somewhere-${slugify(review.name) || slug}.png`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

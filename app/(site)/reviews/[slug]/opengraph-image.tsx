import { ImageResponse } from "next/og";
import { getReview } from "@/lib/repo";
import { buildShareCard, SHARE_CARD_SIZE } from "@/lib/shareCard";

export const size = SHARE_CARD_SIZE;
export const contentType = "image/png";
export const alt = "Restaurant review";

/**
 * Per-review social share card, rendered on demand. Uses only the
 * default font stack — pulling a webfont in here would mean a network
 * fetch on every card render for very little visual gain at this size.
 */
export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await getReview(slug);

  if (!review || review.draft) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#07070a",
            color: "#f3f1ec",
            fontSize: 64,
          }}
        >
          8somewhere
        </div>
      ),
      size
    );
  }

  return new ImageResponse(buildShareCard(review), size);
}

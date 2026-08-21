import type { Review } from "@/data/seed-reviews";
import { TIERS } from "@/lib/tiers";

export const SHARE_CARD_SIZE = { width: 1200, height: 630 };

const ACCENTS: Record<Review["tier"], string> = {
  loved: "#ff8a3d",
  liked: "#ffd166",
  mixed: "#8a8a94",
  avoid: "#e0554f",
  unlogged: "#5c5c66",
};

/**
 * The visual card shared between the crawler-facing OG image
 * (opengraph-image.tsx) and the user-facing downloadable share card
 * (share-card/route.tsx) — same design, two different callers so a
 * link pasted into Slack and a card someone deliberately downloads
 * look identical.
 */
export function buildShareCard(review: Review) {
  const tier = TIERS[review.tier];
  const stars = tier.stars;
  const accent = ACCENTS[review.tier];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#07070a",
        backgroundImage:
          "radial-gradient(900px 500px at 10% -20%, rgba(255,138,61,0.20), transparent 60%)",
        color: "#f3f1ec",
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9b978f",
          }}
        >
          8somewhere
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {stars === null ? (
            <div style={{ display: "flex", fontSize: 28, color: accent }}>
              Not yet rated
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              {/*
                Drawn as SVG rather than the ★ character: the default
                font in ImageResponse has no glyph for U+2605 and
                renders it as a tofu box.
              */}
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  style={{ opacity: i < stars ? 1 : 0.25 }}
                >
                  <path
                    d="M12 2.5l2.86 6.24 6.64.62-5.03 4.5 1.5 6.64L12 16.9l-6 3.6 1.5-6.64-5.03-4.5 6.64-.62L12 2.5z"
                    fill={accent}
                  />
                </svg>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: review.name.length > 26 ? 68 : 88,
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          {review.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#9b978f",
            maxWidth: 980,
            lineHeight: 1.35,
          }}
        >
          {review.verdict.length > 120
            ? review.verdict.slice(0, 117) + "…"
            : review.verdict}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          fontSize: 26,
          color: "#9b978f",
          borderTop: "1px solid #23232b",
          paddingTop: 24,
        }}
      >
        <div style={{ display: "flex" }}>
          {[review.cuisine, review.city, review.price].filter(Boolean).join("  ·  ")}
        </div>
      </div>
    </div>
  );
}

import { ImageResponse } from "next/og";

/**
 * The share card the service and product pages generate, in the same blueprint
 * style as app/opengraph-image.tsx.
 *
 * Per-page rather than one card for the whole site, because the site card names
 * the company and nothing else: shared into a chat or a feed, nine different
 * pages would have produced nine identical previews with no clue which one had
 * been sent.
 *
 * Only flexbox and a subset of CSS work in ImageResponse — no grid, no
 * shorthand `border` on a partially-styled edge — so the layout here is
 * deliberately plain.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function ogCard({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#242b31",
          color: "#f1f3f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: "2px solid #f1f3f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            UFT
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: 4 }}>UFTECH.AI</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#e2a06c",
              marginBottom: 22,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1.08 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#9aa5ad" }}>
          Enterprise AI, from prompt to production.
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

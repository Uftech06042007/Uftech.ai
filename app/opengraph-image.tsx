import { ImageResponse } from "next/og";

export const alt = "UFTECH.AI — Enterprise AI, from prompt to production";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#242b31",
          color: "#f1f3f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
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
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 920 }}>
          Enterprise AI, from prompt to&nbsp;<span style={{ color: "#e2a06c" }}>production.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

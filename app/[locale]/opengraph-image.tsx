import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Harshath Kasim";

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
          padding: "80px",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #1d212c 0%, #14161c 65%)",
          color: "#ecead3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#7e8089",
            fontFamily: "monospace",
          }}
        >
          harshathkasim.com
        </div>
        <div style={{ fontSize: 110, marginTop: 24, display: "flex" }}>
          Harshath&nbsp;<span style={{ color: "#c8a56b" }}>Kasim</span>
        </div>
        <div
          style={{
            fontSize: 34,
            marginTop: 16,
            color: "#c9c7bd",
            fontFamily: "monospace",
          }}
        >
          HR &amp; IT · Projects · Writing · Photography
        </div>
      </div>
    ),
    { ...size }
  );
}

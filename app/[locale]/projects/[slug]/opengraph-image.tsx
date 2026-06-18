import { ImageResponse } from "next/og";
import { getProject } from "@/lib/projects";
import { type Locale } from "@/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Harshath Kasim — Project";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { slug } = await params;
  let title = "Project";
  try {
    title = getProject(slug, "en").meta.title;
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #1d212c 0%, #14161c 65%)",
          color: "#ecead3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#c8a56b",
            fontFamily: "monospace",
          }}
        >
          Project · harshathkasim.com
        </div>
        <div style={{ fontSize: 72, marginTop: 28, lineHeight: 1.1, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ width: 90, height: 4, background: "#c8a56b", marginTop: 36 }} />
        <div
          style={{
            fontSize: 30,
            marginTop: 24,
            color: "#c9c7bd",
            fontFamily: "monospace",
          }}
        >
          Harshath Kasim
        </div>
      </div>
    ),
    { ...size }
  );
}

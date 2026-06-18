import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { locales } from "@/i18n/config";
import { getProjectSlugs } from "@/lib/projects";
import { getPostSlugs } from "@/lib/writing";
import { getGameSlugs } from "@/lib/games";
import { getPhotos } from "@/lib/photos";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/projects", "/writing", "/photos", "/games", "/about"];
  const dynamicPaths = [
    ...getProjectSlugs().map((s) => `/projects/${s}`),
    ...getPostSlugs().map((s) => `/writing/${s}`),
    ...getGameSlugs().map((s) => `/games/${s}`),
  ];
  const allPaths = [...staticPaths, ...dynamicPaths];

  // Expose gallery images so they can be indexed by Google Images.
  const photoImages = getPhotos("en").map((p) => `${SITE_URL}${p.src}`);

  return allPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          ar: `${SITE_URL}/ar${path}`,
        },
      },
      ...(path === "/photos" ? { images: photoImages } : {}),
    }))
  );
}

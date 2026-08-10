import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { locales } from "@/i18n/config";
import { getProjectSlugs } from "@/lib/projects";
import { getPostSlugs, getAllPosts } from "@/lib/writing";
import { getGameSlugs } from "@/lib/games";
import { getPhotos } from "@/lib/photos";
import { getPromptImages } from "@/lib/prompts";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/prompts",
    "/tools/image-optimiser",
    "/services",
    "/mahalli-pro",
    "/projects",
    "/writing",
    "/photos",
    "/games",
    "/about",
  ];
  const dynamicPaths = [
    ...getProjectSlugs().map((s) => `/projects/${s}`),
    ...getPostSlugs().map((s) => `/writing/${s}`),
    ...getGameSlugs().map((s) => `/games/${s}`),
  ];
  const allPaths = [...staticPaths, ...dynamicPaths];

  // Expose gallery and prompt-example images so they can be indexed by
  // Google Images.
  const photoImages = getPhotos("en").map((p) => `${SITE_URL}${p.src}`);
  const promptImages = getPromptImages().map((src) => `${SITE_URL}${src}`);

  // Real publication dates, so lastmod is a signal Google can trust.
  // Anything without a genuine content date omits lastmod entirely —
  // an inaccurate date is worse than none.
  const posts = getAllPosts("en");
  const postDates = new Map(posts.map((p) => [`/writing/${p.slug}`, p.date]));
  const newestPost = posts[0]?.date;

  function lastModified(path: string): string | undefined {
    if (postDates.has(path)) return postDates.get(path);
    if (path === "/writing") return newestPost;
    return undefined;
  }

  return allPaths.flatMap((path) => {
    const modified = lastModified(path);
    return locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      ...(modified ? { lastModified: modified } : {}),
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          ar: `${SITE_URL}/ar${path}`,
        },
      },
      ...(path === "/photos" ? { images: photoImages } : {}),
      ...(path === "/prompts" ? { images: promptImages } : {}),
    }));
  });
}

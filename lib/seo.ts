import type { Locale } from "@/i18n/config";

export const SITE_URL = "https://harshathkasim.com";
export const SITE_NAME = "Harshath Kasim";

/**
 * Builds canonical + hreflang alternates for a page.
 * `path` is the route after the locale, e.g. "/projects" or "" for home.
 */
export function alternates(locale: Locale, path = "") {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      en: `/en${path}`,
      ar: `/ar${path}`,
      "x-default": `/en${path}`,
    },
  };
}

import data from "@/content/photos.json";
import type { Locale } from "@/i18n/config";

type RawPhoto = {
  src: string;
  alt: Record<Locale, string>;
  caption?: Record<Locale, string>;
};

export type Photo = {
  src: string;
  alt: string;
  caption?: string;
};

export function getPhotos(locale: Locale): Photo[] {
  return (data as RawPhoto[]).map((p) => ({
    src: p.src,
    alt: p.alt[locale],
    caption: p.caption?.[locale],
  }));
}

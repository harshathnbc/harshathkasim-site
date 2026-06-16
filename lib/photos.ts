import data from "@/content/photos.json";
import type { Locale } from "@/i18n/config";

type RawPhoto = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  caption?: Record<Locale, string>;
};

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export function getPhotos(locale: Locale): Photo[] {
  return (data as RawPhoto[]).map((p) => ({
    src: p.src,
    width: p.width,
    height: p.height,
    alt: p.alt[locale],
    caption: p.caption?.[locale],
  }));
}

import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import PhotoGallery from "@/components/PhotoGallery";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getPhotos } from "@/lib/photos";
import { alternates, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.photos.title, alternates: alternates(locale, "/photos") };
}

export default async function PhotosPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.photos;
  const photos = getPhotos(locale);

  const galleryLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${t.title} — Harshath Kasim`,
    url: `${SITE_URL}/${locale}/photos`,
    image: photos.map((p) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE_URL}${p.src}`,
      caption: p.caption ?? p.alt,
      description: p.alt,
      width: p.width,
      height: p.height,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <JsonLd data={galleryLd} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      {photos.length === 0 ? (
        <ComingSoon note={t.note} />
      ) : (
        <PhotoGallery
          photos={photos}
          labels={{ close: t.close, prev: t.prev, next: t.next }}
        />
      )}
    </div>
  );
}

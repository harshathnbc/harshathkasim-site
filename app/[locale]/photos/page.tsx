import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import PhotoGallery from "@/components/PhotoGallery";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getPhotos } from "@/lib/photos";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.photos.title };
}

export default async function PhotosPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.photos;
  const photos = getPhotos(locale);

  return (
    <div className="mx-auto max-w-5xl px-6">
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

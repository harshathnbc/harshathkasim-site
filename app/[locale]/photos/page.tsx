import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.photos.title };
}

export default async function PhotosPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.photos;
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <ComingSoon note={t.note} />
    </div>
  );
}

import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import ImageConverter from "@/components/tools/ImageConverter";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolConvert;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/image-converter"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolConvert;

  return (
    <ToolShell
      locale={locale}
      slug="image-converter"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <ImageConverter
        labels={{
          drop: t.drop,
          choose: t.choose,
          format: t.format,
          quality: t.quality,
          original: t.original,
          converted: t.converted,
          download: t.download,
          reset: t.reset,
          working: t.working,
          error: t.error,
        }}
      />
    </ToolShell>
  );
}

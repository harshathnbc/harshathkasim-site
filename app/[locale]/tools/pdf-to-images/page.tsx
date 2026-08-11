import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PdfToImages from "@/components/tools/PdfToImages";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPdfImages;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/pdf-to-images"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPdfImages;

  return (
    <ToolShell
      locale={locale}
      slug="pdf-to-images"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PdfToImages
        labels={{
          choose: t.choose,
          dpi: t.dpi,
          format: t.format,
          quality: t.quality,
          convert: t.convert,
          working: t.working,
          page: t.page,
          pages: t.pages,
          result: t.result,
          download: t.download,
          downloadZip: t.downloadZip,
          reset: t.reset,
          error: t.error,
          encrypted: t.encrypted,
        }}
      />
    </ToolShell>
  );
}

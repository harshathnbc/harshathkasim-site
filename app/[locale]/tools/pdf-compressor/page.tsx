import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PdfCompressor from "@/components/tools/PdfCompressor";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPdfCompress;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/pdf-compressor"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPdfCompress;

  return (
    <ToolShell
      locale={locale}
      slug="pdf-compressor"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PdfCompressor
        labels={{
          choose: t.choose,
          warning: t.warning,
          dpi: t.dpi,
          quality: t.quality,
          grayscale: t.grayscale,
          compress: t.compress,
          working: t.working,
          page: t.page,
          original: t.original,
          compressed: t.compressed,
          saved: t.saved,
          larger: t.larger,
          download: t.download,
          reset: t.reset,
          error: t.error,
          encrypted: t.encrypted,
        }}
      />
    </ToolShell>
  );
}

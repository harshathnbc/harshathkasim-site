import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PdfToWord from "@/components/tools/PdfToWord";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPdfWord;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/pdf-to-word"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPdfWord;

  return (
    <ToolShell
      locale={locale}
      slug="pdf-to-word"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PdfToWord
        labels={{
          choose: t.choose,
          warning: t.warning,
          convert: t.convert,
          working: t.working,
          page: t.page,
          result: t.result,
          words: t.words,
          noText: t.noText,
          preview: t.preview,
          download: t.download,
          downloadTxt: t.downloadTxt,
          reset: t.reset,
          error: t.error,
          encrypted: t.encrypted,
        }}
      />
    </ToolShell>
  );
}

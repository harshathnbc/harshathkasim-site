import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PdfTools from "@/components/tools/PdfTools";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPdf;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/pdf-tools"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPdf;

  return (
    <ToolShell
      locale={locale}
      slug="pdf-tools"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PdfTools
        labels={{
          merge: t.merge,
          split: t.split,
          chooseMerge: t.chooseMerge,
          chooseSplit: t.chooseSplit,
          selected: t.selected,
          pages: t.pages,
          rangeLabel: t.rangeLabel,
          rangeHint: t.rangeHint,
          run: t.run,
          working: t.working,
          download: t.download,
          reset: t.reset,
          error: t.error,
          encrypted: t.encrypted,
          needTwo: t.needTwo,
          badRange: t.badRange,
        }}
      />
    </ToolShell>
  );
}

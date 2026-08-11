import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PdfEditor from "@/components/tools/PdfEditor";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPdfEdit;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/pdf-editor"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPdfEdit;

  return (
    <ToolShell
      locale={locale}
      slug="pdf-editor"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PdfEditor
        labels={{
          choose: t.choose,
          latinNote: t.latinNote,
          modeText: t.modeText,
          modeImage: t.modeImage,
          modeMove: t.modeMove,
          hintText: t.hintText,
          hintImage: t.hintImage,
          hintMove: t.hintMove,
          textContent: t.textContent,
          fontSize: t.fontSize,
          colour: t.colour,
          imageWidth: t.imageWidth,
          chooseImage: t.chooseImage,
          prev: t.prev,
          next: t.next,
          pageOf: t.pageOf,
          rotateLeft: t.rotateLeft,
          rotateRight: t.rotateRight,
          deletePage: t.deletePage,
          deleteItem: t.deleteItem,
          itemsOnPage: t.itemsOnPage,
          save: t.save,
          working: t.working,
          download: t.download,
          reset: t.reset,
          error: t.error,
          encrypted: t.encrypted,
        }}
      />
    </ToolShell>
  );
}

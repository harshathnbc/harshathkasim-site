import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import QrGenerator from "@/components/tools/QrGenerator";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolQr;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/qr-generator"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolQr;

  return (
    <ToolShell
      locale={locale}
      slug="qr-generator"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <QrGenerator
        labels={{
          inputLabel: t.inputLabel,
          placeholder: t.placeholder,
          size: t.size,
          download: t.download,
          empty: t.empty,
        }}
      />
    </ToolShell>
  );
}

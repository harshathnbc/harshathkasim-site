import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import HijriConverter from "@/components/tools/HijriConverter";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolHijri;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/hijri-converter"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolHijri;

  return (
    <ToolShell
      locale={locale}
      slug="hijri-converter"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <HijriConverter
        locale={locale}
        labels={{
          gregorianToHijri: t.gregorianToHijri,
          hijriToGregorian: t.hijriToGregorian,
          gregorianDate: t.gregorianDate,
          hijriDate: t.hijriDate,
          day: t.day,
          month: t.month,
          year: t.year,
          result: t.result,
          today: t.today,
          invalid: t.invalid,
        }}
      />
    </ToolShell>
  );
}

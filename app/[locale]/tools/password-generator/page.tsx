import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolPassword;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/password-generator"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolPassword;

  return (
    <ToolShell
      locale={locale}
      slug="password-generator"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <PasswordGenerator
        labels={{
          length: t.length,
          upper: t.upper,
          lower: t.lower,
          numbers: t.numbers,
          symbols: t.symbols,
          regenerate: t.regenerate,
          copy: t.copy,
          copied: t.copied,
          strength: t.strength,
          weak: t.weak,
          fair: t.fair,
          strong: t.strong,
          excellent: t.excellent,
          noneSelected: t.noneSelected,
        }}
      />
    </ToolShell>
  );
}

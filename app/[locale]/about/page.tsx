import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.about.title, alternates: alternates(locale, "/about") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.about;
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <div className="max-w-2xl space-y-5 text-text-soft leading-relaxed text-[0.95rem]">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>
          {t.p2a}
          <a
            href="mailto:hello@harshathkasim.com"
            dir="ltr"
            className="link-underline text-text hover:text-accent"
          >
            hello@harshathkasim.com
          </a>
          {t.p2b}
        </p>
      </div>
    </div>
  );
}

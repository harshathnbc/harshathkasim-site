import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.services.title, alternates: alternates(locale, "/services") };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.services;
  const mailto = `mailto:hello@harshathkasim.com?subject=${encodeURIComponent(t.mailSubject)}`;

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <ul className="grid sm:grid-cols-3 gap-4">
        {t.offerings.map((o, i) => (
          <li key={i} className="glass-card flex h-full flex-col p-5">
            <h2 className="font-serif text-xl text-text">{o.title}</h2>
            <p className="mt-2 text-sm text-text-soft leading-relaxed">{o.desc}</p>
          </li>
        ))}
      </ul>

      <div className="glass-card mt-12 p-8 flex flex-col items-start gap-3">
        <h2 className="font-serif text-2xl text-text">{t.ctaHeading}</h2>
        <a href={mailto} className="btn-glass px-5 py-2.5 text-sm text-text">
          {t.ctaText}
        </a>
        <a
          href="mailto:hello@harshathkasim.com"
          dir="ltr"
          className="link-underline text-sm text-text-soft hover:text-text"
        >
          hello@harshathkasim.com
        </a>
      </div>
    </div>
  );
}

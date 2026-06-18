import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.pages.mahalli.title,
    description: dict.pages.mahalli.tagline,
    alternates: alternates(locale, "/mahalli-pro"),
  };
}

export default async function MahalliProPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.mahalli;
  const mailto = `mailto:hello@harshathkasim.com?subject=${encodeURIComponent(t.mailSubject)}`;

  return (
    <div className="mx-auto max-w-3xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.tagline} />

      <span className="inline-block rounded-full bg-muted/15 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-muted">
        {t.status}
      </span>

      <p className="mt-8 text-text-soft leading-relaxed text-[0.95rem]">{t.intro}</p>

      <ul className="mt-8 space-y-3">
        {t.points.map((p, i) => (
          <li key={i} className="flex gap-3 text-text-soft text-[0.95rem]">
            <span className="text-accent" aria-hidden>—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="glass-card mt-12 p-8 flex flex-col items-start gap-3">
        <h2 className="font-serif text-2xl text-text">{t.ctaHeading}</h2>
        <a href={mailto} className="btn-glass px-5 py-2.5 text-sm text-text">
          {t.ctaText}
        </a>
      </div>
    </div>
  );
}

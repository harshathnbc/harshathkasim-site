import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PromptsGallery from "@/components/PromptsGallery";
import JsonLd from "@/components/JsonLd";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates, SITE_URL } from "@/lib/seo";
import { getPrompts } from "@/lib/prompts";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.prompts;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/prompts"),
  };
}

export default async function PromptsPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.prompts;
  const prompts = getPrompts(locale);

  // HowTo schema — this page is a genuine step-by-step, so it can earn a rich result.
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t.title,
    description: t.intro,
    inLanguage: locale,
    url: `${SITE_URL}/${locale}/prompts`,
    step: t.howTo.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <JsonLd data={howToLd} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <section className="glass-card mb-10 p-6">
        <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-4">
          {t.howToTitle}
        </h2>
        <ol className="space-y-2">
          {t.howTo.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-text-soft leading-relaxed">
              <span className="text-accent font-mono shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <PromptsGallery
        prompts={prompts}
        labels={{
          all: t.all,
          copy: t.copy,
          copied: t.copied,
          soon: t.soon,
        }}
      />
    </div>
  );
}

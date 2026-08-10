import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import PromptsGallery from "@/components/PromptsGallery";
import JsonLd from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";
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
  const dict = await getDictionary(locale);
  const t = dict.pages.prompts;
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

      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-2">
          {t.referenceTitle}
        </h2>
        <p className="text-sm text-text-soft leading-relaxed mb-4 max-w-2xl">
          {t.referenceNote}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { src: "/prompts/base-man.webp", alt: t.referenceAltMan },
            { src: "/prompts/base-woman.webp", alt: t.referenceAltWoman },
          ].map((img) => (
            <div key={img.src} className="overflow-hidden rounded-xl glass-frame">
              <Image
                src={img.src}
                alt={img.alt}
                width={1400}
                height={764}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>
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

      <div className="mt-12 pt-6 border-t border-line/50">
        <ShareButtons
          url={`${SITE_URL}/${locale}/prompts`}
          title={t.title}
          labels={dict.share}
        />
      </div>
    </div>
  );
}

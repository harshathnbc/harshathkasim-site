import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ImageOptimizer from "@/components/ImageOptimizer";
import ShareButtons from "@/components/ShareButtons";
import JsonLd from "@/components/JsonLd";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.tools;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/image-optimiser"),
  };
}

export default async function ImageOptimiserPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.tools;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title,
    description: t.intro,
    url: `${SITE_URL}/${locale}/tools/image-optimiser`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Harshath Kasim", url: SITE_URL },
  };

  return (
    <div className="mx-auto max-w-3xl px-6">
      <JsonLd data={appLd} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <p className="mb-8 text-sm text-accent">{t.privacy}</p>

      <ImageOptimizer
        labels={{
          drop: t.drop,
          choose: t.choose,
          maxWidth: t.maxWidth,
          quality: t.quality,
          format: t.format,
          original: t.original,
          optimized: t.optimized,
          saved: t.saved,
          download: t.download,
          reset: t.reset,
          working: t.working,
          error: t.error,
        }}
      />

      <div className="mt-12 pt-6 border-t border-line/50">
        <ShareButtons
          url={`${SITE_URL}/${locale}/tools/image-optimiser`}
          title={t.title}
          labels={dict.share}
        />
      </div>
    </div>
  );
}

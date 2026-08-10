import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ShareButtons from "@/components/ShareButtons";
import JsonLd from "@/components/JsonLd";
import type { Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

/** Shared chrome for every tool page: header, schema, back link and sharing. */
export default function ToolShell({
  locale,
  slug,
  eyebrow,
  title,
  intro,
  backLabel,
  share,
  children,
}: {
  locale: Locale;
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  backLabel: string;
  share: { share: string; copyLink: string; linkCopied: string };
  children: React.ReactNode;
}) {
  const url = `${SITE_URL}/${locale}/tools/${slug}`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description: intro,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Harshath Kasim", url: SITE_URL },
  };

  return (
    <div className="mx-auto max-w-3xl px-6">
      <JsonLd data={appLd} />
      <Link
        href={`/${locale}/tools`}
        className="inline-block mt-12 text-sm text-muted hover:text-text transition-colors"
      >
        {backLabel}
      </Link>

      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />

      {children}

      <div className="mt-12 pt-6 border-t border-line/50">
        <ShareButtons url={url} title={title} labels={share} />
      </div>
    </div>
  );
}

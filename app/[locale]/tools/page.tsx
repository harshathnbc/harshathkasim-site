import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ShareButtons from "@/components/ShareButtons";
import JsonLd from "@/components/JsonLd";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates, SITE_URL } from "@/lib/seo";
import { TOOLS, toolPath } from "@/lib/toolsList";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolsIndex;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools"),
  };
}

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolsIndex;

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    description: t.intro,
    itemListElement: TOOLS.map((tool, i) => {
      const d = dict.pages[tool.dictKey];
      return {
        "@type": "ListItem",
        position: i + 1,
        name: d.title,
        description: d.intro,
        url: `${SITE_URL}${toolPath(locale, tool.slug)}`,
      };
    }),
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <JsonLd data={listLd} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <p className="mb-8 text-sm text-accent">{t.privacy}</p>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const d = dict.pages[tool.dictKey];
          return (
            <li key={tool.slug}>
              <Link
                href={toolPath(locale, tool.slug)}
                className="group glass-card flex h-full flex-col p-5"
              >
                <span className="text-2xl text-accent" aria-hidden>
                  {tool.icon}
                </span>
                <h2 className="mt-3 font-serif text-xl text-text group-hover:text-accent transition-colors">
                  {d.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-text-soft leading-relaxed">
                  {d.intro}
                </p>
                <span className="mt-4 text-sm text-accent">{t.open}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 pt-6 border-t border-line/50">
        <ShareButtons
          url={`${SITE_URL}/${locale}/tools`}
          title={t.title}
          labels={dict.share}
        />
      </div>
    </div>
  );
}

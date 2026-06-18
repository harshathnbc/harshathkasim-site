import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/config";
import { getPost, getPostSlugs, getAllPosts, formatDate } from "@/lib/writing";
import JsonLd from "@/components/JsonLd";
import { alternates, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  const slugs = getPostSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const { meta } = getPost(slug, locale);
    return {
      title: meta.title,
      description: meta.excerpt,
      alternates: alternates(locale, `/writing/${slug}`),
    };
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = (await getDictionary(locale)).pages.writing;

  let post;
  try {
    post = getPost(slug, locale);
  } catch {
    notFound();
  }

  const { meta, content } = post;
  const { content: body } = await compileMDX({ source: content });
  const related = getAllPosts(locale).filter((p) => p.slug !== slug).slice(0, 2);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.excerpt,
    datePublished: meta.date,
    inLanguage: locale,
    url: `${SITE_URL}/${locale}/writing/${slug}`,
    author: { "@type": "Person", name: "Harshath Kasim", url: SITE_URL },
  };

  return (
    <article className="mx-auto max-w-3xl px-6">
      <JsonLd data={articleLd} />
      <Link
        href={`/${locale}/writing`}
        className="inline-block mt-12 text-sm text-muted hover:text-text transition-colors"
      >
        {t.back}
      </Link>

      <PageHeader eyebrow={formatDate(meta.date, locale)} title={meta.title} />

      <div className="mdx">{body}</div>

      {meta.tags?.length > 0 && (
        <div className="mt-12 pt-6 border-t border-line/50 flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-line/50 px-2 py-0.5 text-[0.65rem] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <nav className="mt-14 pt-8 border-t border-line/50">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-5">
            {t.more}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${locale}/writing/${p.slug}`}
                  className="group glass-card block h-full p-4"
                >
                  <h3 className="font-serif text-lg text-text group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-soft leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}

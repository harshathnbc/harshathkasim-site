import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/config";
import { getPost, getPostSlugs, formatDate } from "@/lib/writing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  const slugs = getPostSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const { meta } = getPost(slug, locale);
    return { title: meta.title, description: meta.excerpt };
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

  return (
    <article className="mx-auto max-w-3xl px-6">
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
    </article>
  );
}

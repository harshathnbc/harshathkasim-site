import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/config";
import { getProject, getProjectSlugs } from "@/lib/projects";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  const slugs = getProjectSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const { meta } = getProject(slug, locale);
    return { title: meta.title, description: meta.summary };
  } catch {
    return {};
  }
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = (await getDictionary(locale)).pages.projects;

  let project;
  try {
    project = getProject(slug, locale);
  } catch {
    notFound();
  }

  const { meta, content } = project;
  const { content: body } = await compileMDX({ source: content });

  return (
    <article className="mx-auto max-w-3xl px-6">
      <Link
        href={`/${locale}/projects`}
        className="no-print inline-block mt-12 text-sm text-muted hover:text-text transition-colors"
      >
        {t.back}
      </Link>

      <PageHeader eyebrow={meta.role} title={meta.title} intro={meta.summary} />

      <div className="-mt-4 mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider ${
            meta.status === "live"
              ? "bg-accent/15 text-accent"
              : "bg-muted/15 text-muted"
          }`}
        >
          {meta.status === "live" ? t.statusLive : t.statusDevelopment}
        </span>
        {meta.tags.map((tag) => (
          <span key={tag} className="text-xs text-muted">
            {tag}
          </span>
        ))}
        {meta.url && (
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="link-underline text-accent hover:text-text ms-auto"
          >
            {t.visit}
          </a>
        )}
      </div>

      <div className="mdx">{body}</div>
    </article>
  );
}

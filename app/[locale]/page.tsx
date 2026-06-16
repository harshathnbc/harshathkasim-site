import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getAllProjects } from "@/lib/projects";
import JsonLd from "@/components/JsonLd";
import { alternates, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternates(locale, "") };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const tp = dict.pages.projects;
  const featured = getAllProjects(locale).slice(0, 3);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Harshath Kasim",
    url: SITE_URL,
    jobTitle:
      locale === "ar"
        ? "مدير الموارد البشرية وتكنولوجيا المعلومات"
        : "HR & IT Manager",
    email: "mailto:hello@harshathkasim.com",
    sameAs: ["https://www.linkedin.com/in/harshath-kasim-7689b7a3/"],
  };

  const sections = [
    { href: `/${locale}/projects`, label: dict.nav.projects, blurb: t.sections.projects },
    { href: `/${locale}/cv`, label: dict.nav.cv, blurb: t.sections.cv },
    { href: `/${locale}/writing`, label: dict.nav.writing, blurb: t.sections.writing },
    { href: `/${locale}/photos`, label: dict.nav.photos, blurb: t.sections.photos },
    { href: `/${locale}/games`, label: dict.nav.games, blurb: t.sections.games },
    { href: `/${locale}/about`, label: dict.nav.about, blurb: t.sections.about },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6">
      <JsonLd data={personLd} />
      {/* Hero */}
      <section className="min-h-[72vh] flex flex-col justify-center py-20">
        <p className="text-xs uppercase tracking-[0.32em] text-muted mb-6" dir="ltr">
          {t.eyebrow}
        </p>
        <h1 className="font-serif font-normal leading-[1.02] text-text text-[clamp(3rem,10vw,6.5rem)]" dir="ltr">
          Harshath <span className="italic text-accent">Kasim</span>
        </h1>
        <div className="w-12 h-px bg-line my-8" aria-hidden />
        <p className="font-mono text-text-soft leading-relaxed max-w-xl text-[0.95rem]">
          {t.tagline}
        </p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href={`/${locale}/projects`} className="link-underline text-text hover:text-accent transition-colors">
            {t.ctaProjects}
          </Link>
          <Link href={`/${locale}/cv`} className="link-underline text-text-soft hover:text-text transition-colors">
            {t.ctaCv}
          </Link>
          <a href="mailto:hello@harshathkasim.com" className="link-underline text-text-soft hover:text-text transition-colors">
            {t.ctaContact}
          </a>
        </div>
      </section>

      {/* Featured work */}
      <section className="pb-4">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted">
            {t.featuredLabel}
          </h2>
          <Link
            href={`/${locale}/projects`}
            className="link-underline text-sm text-text-soft hover:text-text transition-colors"
          >
            {t.viewAllProjects}
          </Link>
        </div>
        <ul className="grid sm:grid-cols-3 gap-4">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/${locale}/projects/${p.slug}`}
                className="group flex h-full flex-col rounded-lg border border-line/60 bg-surface/40 p-5 transition-colors hover:border-accent/50 hover:bg-surface/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl text-text group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <span
                    className={`shrink-0 mt-1 rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-wider ${
                      p.status === "live"
                        ? "bg-accent/15 text-accent"
                        : "bg-muted/15 text-muted"
                    }`}
                  >
                    {p.status === "live" ? tp.statusLive : tp.statusDevelopment}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-soft leading-relaxed">
                  {p.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Section index */}
      <section className="pt-16 pb-12">
        <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-8">
          {t.exploreLabel}
        </h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group block h-full rounded-lg border border-line/60 bg-surface/40 p-5 transition-colors hover:border-accent/50 hover:bg-surface/70"
              >
                <span className="font-serif text-2xl text-text group-hover:text-accent transition-colors">
                  {s.label}
                </span>
                <p className="mt-2 text-sm text-text-soft leading-relaxed">
                  {s.blurb}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

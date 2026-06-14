import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getAllPosts, formatDate } from "@/lib/writing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.writing.title };
}

export default async function WritingPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.writing;
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-3xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      {posts.length === 0 ? (
        <ComingSoon note={t.note} />
      ) : (
        <ul className="divide-y divide-line/50">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/${locale}/writing/${p.slug}`}
                className="group block py-6 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl text-text group-hover:text-accent transition-colors">
                    {p.title}
                  </h2>
                  <time
                    dateTime={p.date}
                    className="shrink-0 text-xs text-muted font-mono whitespace-nowrap"
                  >
                    {formatDate(p.date, locale)}
                  </time>
                </div>
                <p className="mt-2 text-sm text-text-soft leading-relaxed">
                  {p.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

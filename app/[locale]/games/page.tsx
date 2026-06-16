import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getGames } from "@/lib/games";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.games.title, alternates: alternates(locale, "/games") };
}

export default async function GamesPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.games;
  const games = getGames(locale);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      {games.length === 0 ? (
        <ComingSoon note={t.note} />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {games.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/${locale}/games/${g.slug}`}
                className="group glass-card flex h-full flex-col p-5"
              >
                <h2 className="font-serif text-2xl text-text group-hover:text-accent transition-colors">
                  {g.title}
                </h2>
                <p className="mt-2 text-sm text-text-soft leading-relaxed flex-1">
                  {g.description}
                </p>
                <span className="mt-4 text-sm text-accent">{t.play}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

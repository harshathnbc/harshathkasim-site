import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TicTacToe from "@/components/games/TicTacToe";
import Memory from "@/components/games/Memory";
import Game2048 from "@/components/games/Game2048";
import Snake from "@/components/games/Snake";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/config";
import { getGame, getGameSlugs } from "@/lib/games";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  const slugs = getGameSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = getGame(slug, locale);
  return game ? { title: game.title, description: game.description } : {};
}

export default async function GamePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = (await getDictionary(locale)).pages.games;
  const game = getGame(slug, locale);

  if (!game) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6">
      <Link
        href={`/${locale}/games`}
        className="inline-block mt-12 text-sm text-muted hover:text-text transition-colors"
      >
        {t.back}
      </Link>

      <PageHeader title={game.title} intro={game.description} />

      <div className="mt-6">
        {slug === "tic-tac-toe" && <TicTacToe labels={t.ttt} />}
        {slug === "memory" && <Memory labels={t.memory} />}
        {slug === "2048" && <Game2048 labels={t.g2048} />}
        {slug === "snake" && <Snake labels={t.snake} />}
      </div>
    </div>
  );
}

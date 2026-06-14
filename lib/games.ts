import data from "@/content/games.json";
import type { Locale } from "@/i18n/config";

type RawGame = {
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: string[];
};

export type GameMeta = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export function getGameSlugs(): string[] {
  return (data as RawGame[]).map((g) => g.slug);
}

export function getGames(locale: Locale): GameMeta[] {
  return (data as RawGame[]).map((g) => ({
    slug: g.slug,
    title: g.title[locale],
    description: g.description[locale],
    tags: g.tags,
  }));
}

export function getGame(slug: string, locale: Locale): GameMeta | undefined {
  return getGames(locale).find((g) => g.slug === slug);
}

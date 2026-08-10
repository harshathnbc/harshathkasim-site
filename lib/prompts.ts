import data from "@/content/prompts.json";
import type { Locale } from "@/i18n/config";

type PromptImages = { man: string; woman: string };

type RawPrompt = {
  slug: string;
  category: string;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
  prompt: string;
  /** Example results in /public/prompts, one per reference subject. */
  images?: PromptImages;
  width?: number;
  height?: number;
};

export type Prompt = {
  slug: string;
  category: string;
  title: string;
  note: string;
  prompt: string;
  images?: PromptImages;
  width?: number;
  height?: number;
};

export function getPrompts(locale: Locale): Prompt[] {
  return (data as RawPrompt[]).map((p) => ({
    slug: p.slug,
    category: p.category,
    title: p.title[locale],
    note: p.note[locale],
    prompt: p.prompt,
    images: p.images,
    width: p.width,
    height: p.height,
  }));
}

export function getPromptImages(): string[] {
  return (data as RawPrompt[]).flatMap((p) =>
    p.images ? [p.images.man, p.images.woman] : []
  );
}

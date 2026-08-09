import data from "@/content/prompts.json";
import type { Locale } from "@/i18n/config";

type RawPrompt = {
  slug: string;
  category: string;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
  prompt: string;
  /** Optional example image in /public/prompts. Omit until one exists. */
  image?: string;
  width?: number;
  height?: number;
};

export type Prompt = {
  slug: string;
  category: string;
  title: string;
  note: string;
  prompt: string;
  image?: string;
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
    image: p.image,
    width: p.width,
    height: p.height,
  }));
}

export function getPromptImages(): string[] {
  return (data as RawPrompt[]).flatMap((p) => (p.image ? [p.image] : []));
}

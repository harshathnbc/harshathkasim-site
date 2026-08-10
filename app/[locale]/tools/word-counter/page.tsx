import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import WordCounter from "@/components/tools/WordCounter";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.toolCounter;
  return {
    title: t.title,
    description: t.intro,
    alternates: alternates(locale, "/tools/word-counter"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.pages.toolCounter;

  return (
    <ToolShell
      locale={locale}
      slug="word-counter"
      eyebrow={t.eyebrow}
      title={t.title}
      intro={t.intro}
      backLabel={dict.pages.toolsIndex.back}
      share={dict.share}
    >
      <WordCounter
        labels={{
          placeholder: t.placeholder,
          words: t.words,
          characters: t.characters,
          charactersNoSpaces: t.charactersNoSpaces,
          sentences: t.sentences,
          paragraphs: t.paragraphs,
          readingTime: t.readingTime,
          minutes: t.minutes,
          clear: t.clear,
        }}
      />
    </ToolShell>
  );
}

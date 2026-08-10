"use client";

import { useMemo, useState } from "react";

type Labels = {
  placeholder: string;
  words: string;
  characters: string;
  charactersNoSpaces: string;
  sentences: string;
  paragraphs: string;
  readingTime: string;
  minutes: string;
  clear: string;
};

export default function WordCounter({ labels }: { labels: Labels }) {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    // Count terminators for Latin and Arabic full stops / question marks.
    const sentences = trimmed
      ? (trimmed.match(/[.!?؟。]+(\s|$)/g) || []).length || 1
      : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    // 200 wpm is the common average for silent reading.
    const readingTime = words ? Math.max(1, Math.round(words / 200)) : 0;
    return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime };
  }, [text]);

  const cells = [
    { label: labels.words, value: stats.words },
    { label: labels.characters, value: stats.characters },
    { label: labels.charactersNoSpaces, value: stats.charactersNoSpaces },
    { label: labels.sentences, value: stats.sentences },
    { label: labels.paragraphs, value: stats.paragraphs },
    {
      label: labels.readingTime,
      value: `${stats.readingTime} ${labels.minutes}`,
    },
  ];

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={labels.placeholder}
        className="w-full rounded-xl border border-line/60 bg-surface/40 px-4 py-3 text-sm text-text placeholder:text-muted focus:border-accent/60 focus:outline-none resize-y leading-relaxed"
      />

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cells.map((c) => (
          <li key={c.label} className="glass-card p-4">
            <p className="font-serif text-2xl text-text">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
              {c.label}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setText("")}
        className="btn-glass px-4 py-2 text-sm text-text-soft"
      >
        {labels.clear}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import type { Prompt } from "@/lib/prompts";

type Labels = {
  all: string;
  copy: string;
  copied: string;
  soon: string;
};

function CopyButton({ text, labels }: { text: string; labels: Labels }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API needs a secure context; fall back to a temp textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="btn-glass w-full px-4 py-2 text-sm text-text mt-3"
      aria-live="polite"
    >
      {copied ? `✓ ${labels.copied}` : labels.copy}
    </button>
  );
}

export default function PromptsGallery({
  prompts,
  labels,
}: {
  prompts: Prompt[];
  labels: Labels;
}) {
  const categories = Array.from(new Set(prompts.map((p) => p.category)));
  const [active, setActive] = useState("__all__");

  const filtered =
    active === "__all__" ? prompts : prompts.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {["__all__", ...categories].map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full border px-3.5 py-1 text-xs transition-colors ${
                isActive
                  ? "border-accent/70 text-text bg-accent/10"
                  : "border-line/60 text-muted hover:text-text hover:border-line"
              }`}
            >
              {cat === "__all__" ? labels.all : cat}
            </button>
          );
        })}
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <li key={p.slug} className="glass-card flex h-full flex-col p-4">
            {p.images ? (
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {[p.images.man, p.images.woman].map((src) => (
                  <div key={src} className="overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt={p.title}
                      width={p.width ?? 900}
                      height={p.height ?? 491}
                      sizes="(min-width: 1024px) 17vw, (min-width: 640px) 25vw, 50vw"
                      className="w-full h-auto block"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-3 aspect-square rounded-lg border border-dashed border-line/50 flex items-center justify-center">
                <span className="text-xs text-muted px-4 text-center">{labels.soon}</span>
              </div>
            )}

            <h2 className="font-serif text-xl text-text">{p.title}</h2>
            <p className="mt-1 text-sm text-text-soft leading-relaxed">{p.note}</p>

            <p
              dir="ltr"
              className="mt-3 flex-1 rounded-lg border border-line/40 bg-surface/40 p-3 font-mono text-xs leading-relaxed text-text-soft text-start"
            >
              {p.prompt}
            </p>

            <CopyButton text={p.prompt} labels={labels} />
          </li>
        ))}
      </ul>
    </div>
  );
}

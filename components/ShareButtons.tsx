"use client";

import { useState } from "react";

type Labels = {
  share: string;
  copyLink: string;
  linkCopied: string;
};

export default function ShareButtons({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: Labels;
}) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: "WhatsApp",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: "X",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: "in",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
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
    <div className="no-print flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-muted me-1">
        {labels.share}
      </span>
      {targets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${labels.share} — ${t.name}`}
          className="btn-glass px-3 py-1.5 text-xs text-text-soft hover:text-text"
        >
          {t.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="btn-glass px-3 py-1.5 text-xs text-text-soft hover:text-text"
        aria-live="polite"
      >
        {copied ? `✓ ${labels.linkCopied}` : labels.copyLink}
      </button>
    </div>
  );
}

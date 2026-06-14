"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-md border border-line/70 bg-surface/50 px-4 py-2 text-sm text-text-soft transition-colors hover:border-accent/60 hover:text-text"
    >
      <span aria-hidden>↓</span>
      {label}
    </button>
  );
}

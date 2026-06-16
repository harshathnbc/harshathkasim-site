"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 btn-glass px-4 py-2 text-sm text-text-soft"
    >
      <span aria-hidden>↓</span>
      {label}
    </button>
  );
}

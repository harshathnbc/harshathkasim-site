"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu({
  links,
  label,
}: {
  links: { href: string; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 text-text-soft hover:text-text transition-colors"
      >
        <span className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 glass-nav border-t border-line/40 px-6 py-3">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-text-soft hover:text-accent transition-colors border-b border-line/30 last:border-0"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

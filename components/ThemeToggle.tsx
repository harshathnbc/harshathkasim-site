"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Read whatever the no-flash script already applied.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("hk:theme", next);
    } catch {
      // Storage can be blocked; the theme still applies for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 text-text-soft hover:text-accent transition-colors"
    >
      {/* Render nothing until mounted so server and client markup agree. */}
      <span className="text-base leading-none">
        {theme === null ? "" : theme === "light" ? "☾" : "☀"}
      </span>
    </button>
  );
}

/**
 * Applies the saved theme before first paint, so a light-mode visitor never
 * sees a dark flash (and vice versa). Rendered in <head> as an inline script.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('hk:theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

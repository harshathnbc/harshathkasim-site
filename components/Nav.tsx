import Link from "next/link";
import LangSwitch from "./LangSwitch";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Nav({
  locale,
  nav,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
}) {
  const links = [
    { href: `/${locale}/services`, label: nav.services },
    { href: `/${locale}/projects`, label: nav.projects },
    { href: `/${locale}/writing`, label: nav.writing },
    { href: `/${locale}/photos`, label: nav.photos },
    { href: `/${locale}/games`, label: nav.games },
    { href: `/${locale}/about`, label: nav.about },
  ];

  return (
    <header className="w-full sticky top-0 z-50 glass-nav">
      <nav className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="font-serif text-xl tracking-wide text-text hover:text-accent transition-colors shrink-0"
        >
          Harshath <span className="italic text-accent">Kasim</span>
        </Link>
        <div className="flex items-center gap-7">
          <ul className="hidden sm:flex items-center gap-7 text-sm text-text-soft">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline hover:text-text transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <LangSwitch locale={locale} />
        </div>
      </nav>
    </header>
  );
}

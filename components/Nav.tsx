import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/writing", label: "Writing" },
  { href: "/photos", label: "Photos" },
  { href: "/games", label: "Games" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <header className="w-full border-b border-line/60 sticky top-0 z-50 backdrop-blur-md bg-bg/70">
      <nav className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide text-text hover:text-accent transition-colors"
        >
          Harshath <span className="italic text-accent">Kasim</span>
        </Link>
        <ul className="hidden sm:flex items-center gap-7 text-sm text-text-soft">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-underline hover:text-text transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Mobile: simple condensed menu */}
        <ul className="flex sm:hidden items-center gap-4 text-xs text-text-soft">
          {links.slice(0, 3).map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-text">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

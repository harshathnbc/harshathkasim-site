"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeName, isLocale, type Locale } from "@/i18n/config";

export default function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other = locales.find((l) => l !== locale) as Locale;

  // Swap the leading /<locale> segment for the other locale.
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = other;
  } else {
    segments.splice(1, 0, other);
  }
  const target = segments.join("/") || `/${other}`;

  return (
    <Link
      href={target}
      hrefLang={other}
      className="text-sm text-text-soft hover:text-accent transition-colors link-underline"
      aria-label={`Switch language to ${localeName[other]}`}
    >
      {localeName[other]}
    </Link>
  );
}

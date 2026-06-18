import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Instrument_Serif, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, localeDir, isLocale, type Locale } from "@/i18n/config";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://harshathkasim.com"),
  title: {
    default: "Harshath Kasim",
    template: "%s · Harshath Kasim",
  },
  description:
    "Harshath Kasim — working at the intersection of HR and IT. Projects, writing, photos, and a few small games.",
  alternates: {
    types: { "application/rss+xml": "https://harshathkasim.com/feed.xml" },
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const fontVars = `${instrumentSerif.variable} ${ibmPlexMono.variable} ${ibmPlexArabic.variable}`;

  return (
    <html lang={locale} dir={localeDir[locale as Locale]} className={fontVars}>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">
          {dict.nav.skip}
        </a>
        <Nav locale={locale as Locale} nav={dict.nav} />
        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>
        <Footer newsletter={dict.newsletter} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

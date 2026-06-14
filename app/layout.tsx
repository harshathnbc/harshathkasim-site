import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://harshathkasim.com"),
  title: {
    default: "Harshath Kasim",
    template: "%s · Harshath Kasim",
  },
  description:
    "Harshath Kasim — working at the intersection of HR and IT. Projects, writing, photos, and a few small games.",
  openGraph: {
    title: "Harshath Kasim",
    description:
      "Working at the intersection of HR and IT. Projects, writing, photos, and a few small games.",
    url: "https://harshathkasim.com",
    siteName: "Harshath Kasim",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

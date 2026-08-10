import type { Locale } from "@/i18n/config";

export type ToolEntry = {
  slug: string;
  /** Dictionary key under pages.* holding this tool's title and intro. */
  dictKey:
    | "tools"
    | "toolConvert"
    | "toolQr"
    | "toolPassword"
    | "toolCounter"
    | "toolHijri"
    | "toolPdf";
  icon: string;
  category: "Image" | "PDF" | "Text" | "Utility";
};

/** Every tool, in the order shown on the index page. */
export const TOOLS: ToolEntry[] = [
  { slug: "image-optimiser", dictKey: "tools", icon: "▣", category: "Image" },
  { slug: "image-converter", dictKey: "toolConvert", icon: "⇄", category: "Image" },
  { slug: "pdf-tools", dictKey: "toolPdf", icon: "▤", category: "PDF" },
  { slug: "qr-generator", dictKey: "toolQr", icon: "▦", category: "Utility" },
  { slug: "password-generator", dictKey: "toolPassword", icon: "✳", category: "Utility" },
  { slug: "word-counter", dictKey: "toolCounter", icon: "¶", category: "Text" },
  { slug: "hijri-converter", dictKey: "toolHijri", icon: "☾", category: "Utility" },
];

export function toolPath(locale: Locale, slug: string) {
  return `/${locale}/tools/${slug}`;
}

export function toolSlugs() {
  return TOOLS.map((t) => t.slug);
}

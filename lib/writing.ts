import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/i18n/config";

const DIR = path.join(process.cwd(), "content", "writing");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export function getPostSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  const slugs = new Set<string>();
  for (const file of fs.readdirSync(DIR)) {
    const m = file.match(/^(.+)\.(en|ar)\.mdx$/);
    if (m) slugs.add(m[1]);
  }
  return [...slugs];
}

function readFile(slug: string, locale: Locale) {
  const file = path.join(DIR, `${slug}.${locale}.mdx`);
  return matter(fs.readFileSync(file, "utf8"));
}

export function getAllPosts(locale: Locale): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const { data } = readFile(slug, locale);
      return { slug, ...(data as Omit<PostMeta, "slug">) };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string, locale: Locale) {
  const { data, content } = readFile(slug, locale);
  return { meta: { slug, ...(data as Omit<PostMeta, "slug">) }, content };
}

export function formatDate(date: string, locale: Locale): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

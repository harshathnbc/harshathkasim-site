import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/i18n/config";

const DIR = path.join(process.cwd(), "content", "projects");

export type ProjectStatus = "live" | "development";

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  url?: string;
  status: ProjectStatus;
  role?: string;
  tags: string[];
  order: number;
};

export function getProjectSlugs(): string[] {
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

export function getAllProjects(locale: Locale): ProjectMeta[] {
  return getProjectSlugs()
    .map((slug) => {
      const { data } = readFile(slug, locale);
      return { slug, ...(data as Omit<ProjectMeta, "slug">) };
    })
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string, locale: Locale) {
  const { data, content } = readFile(slug, locale);
  return {
    meta: { slug, ...(data as Omit<ProjectMeta, "slug">) },
    content,
  };
}

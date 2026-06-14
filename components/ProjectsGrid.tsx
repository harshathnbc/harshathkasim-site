"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { ProjectMeta } from "@/lib/projects";

type Labels = {
  all: string;
  statusLive: string;
  statusDevelopment: string;
};

export default function ProjectsGrid({
  locale,
  projects,
  labels,
}: {
  locale: Locale;
  projects: ProjectMeta[];
  labels: Labels;
}) {
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));
  const [active, setActive] = useState<string>("__all__");

  const filtered =
    active === "__all__"
      ? projects
      : projects.filter((p) => p.tags.includes(active));

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["__all__", ...allTags].map((tag) => {
          const isActive = active === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              className={`rounded-full border px-3.5 py-1 text-xs transition-colors ${
                isActive
                  ? "border-accent/70 text-text bg-accent/10"
                  : "border-line/60 text-muted hover:text-text hover:border-line"
              }`}
            >
              {tag === "__all__" ? labels.all : tag}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <ul className="grid sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/${locale}/projects/${p.slug}`}
              className="group flex h-full flex-col rounded-lg border border-line/60 bg-surface/40 p-5 transition-colors hover:border-accent/50 hover:bg-surface/70"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-2xl text-text group-hover:text-accent transition-colors">
                  {p.title}
                </h2>
                <span
                  className={`shrink-0 mt-1 rounded-full px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wider ${
                    p.status === "live"
                      ? "bg-accent/15 text-accent"
                      : "bg-muted/15 text-muted"
                  }`}
                >
                  {p.status === "live" ? labels.statusLive : labels.statusDevelopment}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-soft leading-relaxed flex-1">
                {p.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-line/50 px-2 py-0.5 text-[0.65rem] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

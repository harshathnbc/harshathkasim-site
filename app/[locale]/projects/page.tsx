import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ProjectsGrid from "@/components/ProjectsGrid";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { getAllProjects } from "@/lib/projects";
import { alternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.projects.title, alternates: alternates(locale, "/projects") };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.projects;
  const projects = getAllProjects(locale);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
      <ProjectsGrid
        locale={locale}
        projects={projects}
        labels={{
          all: t.all,
          statusLive: t.statusLive,
          statusDevelopment: t.statusDevelopment,
        }}
      />
    </div>
  );
}

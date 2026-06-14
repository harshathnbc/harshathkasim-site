import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import cvEn from "@/content/cv.en.json";
import cvAr from "@/content/cv.ar.json";

const cvByLocale = { en: cvEn, ar: cvAr } as const;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.pages.cv.title };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  const t = (await getDictionary(locale)).pages.cv;
  const cv = cvByLocale[locale];

  return (
    <div className="mx-auto max-w-3xl px-6 cv-root">
      <PageHeader eyebrow={cv.headline} title={t.title} intro={cv.summary} />

      <div className="no-print -mt-4">
        <PrintButton label={cv.ui.print} />
      </div>

      {/* Experience */}
      <Section title={cv.ui.experience}>
        <div className="space-y-9">
          {cv.experience.map((job, i) => (
            <article key={i} className="border-s border-line/60 ps-5 relative">
              <span
                className="absolute -start-[5px] top-1.5 w-2 h-2 rounded-full bg-accent"
                aria-hidden
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h3 className="font-serif text-2xl text-text leading-tight">{job.role}</h3>
                <span className="text-xs text-muted font-mono whitespace-nowrap">{job.period}</span>
              </div>
              <p className="text-sm text-accent mt-1">
                {job.org} <span className="text-muted">· {job.location}</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-text-soft leading-relaxed list-disc ps-5 marker:text-muted">
                {job.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title={cv.ui.skills}>
        <div className="grid sm:grid-cols-3 gap-6">
          {cv.skills.map((group, i) => (
            <div key={i}>
              <h3 className="text-sm text-text mb-2">{group.category}</h3>
              <ul className="space-y-1 text-sm text-text-soft">
                {group.items.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title={cv.ui.education}>
        {cv.education.map((ed, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <div>
              <h3 className="font-serif text-xl text-text">{ed.degree}</h3>
              <p className="text-sm text-text-soft">{ed.institution}</p>
            </div>
            <span className="text-xs text-muted font-mono whitespace-nowrap">{ed.period}</span>
          </div>
        ))}
      </Section>

      {/* Languages */}
      <Section title={cv.ui.languages}>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-text-soft">
          {cv.languages.map((l, i) => (
            <li key={i}>
              <span className="text-text">{l.name}</span>{" "}
              <span className="text-muted">— {l.level}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Contact */}
      <Section title={cv.ui.contact}>
        <ul className="space-y-1.5 text-sm text-text-soft">
          <li>
            <a href={`mailto:${cv.contact.email}`} dir="ltr" className="link-underline text-text hover:text-accent">
              {cv.contact.email}
            </a>
          </li>
          <li dir="ltr">{cv.contact.phone}</li>
          <li>{cv.contact.location}</li>
          <li>
            <a
              href={cv.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="link-underline text-text hover:text-accent"
            >
              {cv.contact.linkedinLabel}
            </a>
          </li>
        </ul>
      </Section>
    </div>
  );
}

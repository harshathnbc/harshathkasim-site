import Link from "next/link";

const sections = [
  { href: "/projects", label: "Projects", blurb: "Work across HR and IT — systems, processes, and things I've built." },
  { href: "/cv", label: "CV", blurb: "Experience, skills, and a downloadable résumé." },
  { href: "/writing", label: "Writing", blurb: "Notes on people, technology, and where they meet." },
  { href: "/photos", label: "Photos", blurb: "A gallery of moments worth keeping." },
  { href: "/games", label: "Games", blurb: "Small playable experiments built for fun." },
  { href: "/about", label: "About", blurb: "The longer story, and how to get in touch." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="min-h-[72vh] flex flex-col justify-center py-20">
        <p className="text-xs uppercase tracking-[0.32em] text-muted mb-6">
          harshathkasim.com
        </p>
        <h1 className="font-serif font-normal leading-[1.02] text-text text-[clamp(3rem,10vw,6.5rem)]">
          Harshath <span className="italic text-accent">Kasim</span>
        </h1>
        <div className="w-12 h-px bg-line my-8" aria-hidden />
        <p className="font-mono text-text-soft leading-relaxed max-w-xl text-[0.95rem]">
          Working at the intersection of{" "}
          <span className="text-text">HR</span> and{" "}
          <span className="text-text">IT</span> — connecting people and
          process with the systems that support them. This is where I keep my
          projects, writing, photos, and a few small games.
        </p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href="/projects" className="link-underline text-text hover:text-accent transition-colors">
            View projects →
          </Link>
          <Link href="/cv" className="link-underline text-text-soft hover:text-text transition-colors">
            Read my CV
          </Link>
          <a href="mailto:hello@harshathkasim.com" className="link-underline text-text-soft hover:text-text transition-colors">
            Get in touch
          </a>
        </div>
      </section>

      {/* Section index */}
      <section className="pb-12">
        <h2 className="text-xs uppercase tracking-[0.24em] text-muted mb-8">
          Explore
        </h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group block h-full rounded-lg border border-line/60 bg-surface/40 p-5 transition-colors hover:border-accent/50 hover:bg-surface/70"
              >
                <span className="font-serif text-2xl text-text group-hover:text-accent transition-colors">
                  {s.label}
                </span>
                <p className="mt-2 text-sm text-text-soft leading-relaxed">
                  {s.blurb}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

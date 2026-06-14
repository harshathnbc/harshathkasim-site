import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader
        eyebrow="About"
        title="Hello, I'm Harshath."
        intro="I work at the intersection of HR and IT — bringing together people, process, and technology."
      />
      <div className="max-w-2xl space-y-5 text-text-soft leading-relaxed text-[0.95rem]">
        <p>
          This is a short placeholder bio. The full story — my background in
          human resources and information technology, what I care about, and
          what I&apos;m working on now — will go here.
        </p>
        <p>
          The fastest way to reach me is by email at{" "}
          <a
            href="mailto:hello@harshathkasim.com"
            className="link-underline text-text hover:text-accent"
          >
            hello@harshathkasim.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

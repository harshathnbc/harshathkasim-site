import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        intro="Selected work across HR and IT — process design, internal systems, and things I've built or led."
      />
      <ComingSoon note="Project case studies are on the way." />
    </div>
  );
}

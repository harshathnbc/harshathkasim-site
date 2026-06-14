import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "CV" };

export default function CvPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader
        eyebrow="Experience"
        title="Curriculum Vitae"
        intro="My background across human resources and information technology."
      />
      <ComingSoon note="A web CV and downloadable PDF will live here." />
    </div>
  );
}

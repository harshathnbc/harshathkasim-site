import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Writing" };

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader
        eyebrow="Notes"
        title="Writing"
        intro="Thoughts on people, technology, and the space where HR and IT meet."
      />
      <ComingSoon note="Posts are being written. Soon." />
    </div>
  );
}

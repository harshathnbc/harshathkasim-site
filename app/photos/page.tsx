import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Photos" };

export default function PhotosPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow="Gallery" title="Photos" intro="A few moments worth keeping." />
      <ComingSoon note="The gallery is being curated." />
    </div>
  );
}

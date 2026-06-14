import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Games" };

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageHeader eyebrow="Play" title="Games" intro="Small, playable experiments." />
      <ComingSoon note="The first game is in the works." />
    </div>
  );
}

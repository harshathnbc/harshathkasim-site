export default function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="pt-16 pb-10">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.32em] text-muted mb-4">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif font-normal text-text text-[clamp(2.4rem,7vw,4rem)] leading-tight">
        {title}
      </h1>
      {intro && (
        <p className="mt-5 max-w-2xl text-text-soft leading-relaxed text-[0.95rem]">
          {intro}
        </p>
      )}
      <div className="w-12 h-px bg-line mt-8" aria-hidden />
    </header>
  );
}

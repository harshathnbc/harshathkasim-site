export default function ComingSoon({ note }: { note?: string }) {
  return (
    <p className="text-sm text-muted font-mono">
      {note ?? "This section is being built. Check back soon."}
    </p>
  );
}

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escape "<" so a value can never break out of the <script> context,
  // even though all data here is static and build-time.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

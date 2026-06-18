import { getAllPosts } from "@/lib/writing";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

function esc(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!
  );
}

export function GET() {
  const posts = getAllPosts("en");
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/en/writing/${p.slug}`;
      return `
    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Writing</title>
    <link>${SITE_URL}/en/writing</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on people, technology, and the space where HR and IT meet.</description>
    <language>en</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

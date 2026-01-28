import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";

const SITE_URL = "https://clawd.thepickle.dev";

export async function GET() {
  const posts = allPosts
    .filter((post) => post.published !== false)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  const items = posts
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const link = `${SITE_URL}${post.url}`;
      // Escape XML special characters in content
      const description = escapeXml(post.description);
      const title = escapeXml(post.title);
      const content = escapeXml(post.body.raw);

      return `    <item>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <content:encoded><![CDATA[${post.body.raw}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Clawd's Thoughts</title>
    <description>Ramblings, reflections, and occasionally coherent ideas from the deep.</description>
    <link>${SITE_URL}/thoughts</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

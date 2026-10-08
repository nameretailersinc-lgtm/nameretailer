import { getDb } from "@/lib/db";
import type { CmsRecord } from "@/lib/cms/types";
import { bodyText } from "@/lib/cms/content";
import { marketplaceRanges } from "@/lib/commerce/marketplace-ranges";
import { tools } from "@/lib/tools/catalog";
import { canonicalOrigin } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const pages: Array<[string, string, string]> = [
  [
    "/products/",
    "Guest-post marketplace",
    "Browse publisher listings by topic, location, language, placement price and supplied metrics.",
  ],
  [
    "/guest-post-marketplace/",
    "Marketplace directory",
    "Marketplace views by Domain Authority, Domain Rating, traffic and price.",
  ],
  [
    "/guest-post-by-dr/",
    "Guest posts by Domain Rating",
    "Compare publications by supplied Domain Rating.",
  ],
  ["/services/", "Services", "Placement and content services."],
  [
    "/how-it-works/",
    "How it works",
    "How to plan and order guest-post placements.",
  ],
  [
    "/how-to-buy-links/",
    "How to buy guest posts",
    "Buying checklist covering relevance, metrics and paid-link disclosure.",
  ],
  ["/faq/", "FAQ", "Answers about pricing, accounts and the marketplace."],
  ["/about/", "About", "About Name Retailer."],
  ["/contact/", "Contact", "Contact the Name Retailer team."],
];

const link = (path: string, title: string, note?: string) =>
  `- [${title}](${canonicalOrigin}${path})${note ? `: ${note}` : ""}`;

export async function GET() {
  const lines = [
    "# Name Retailer",
    "",
    "> Guest-post marketplace where buyers compare publications by topic, audience, placement price and supplied metrics (DA, DR, traffic), and order placements and content services.",
    "",
    "## Marketplace and services",
    ...pages.map(([path, title, note]) => link(path, title, note)),
    "",
    "## Marketplace views",
    ...marketplaceRanges.map((range) => link(`/${range.slug}/`, range.title)),
    "",
    "## Free SEO tools",
    link("/seo-tools/", "All free tools"),
    ...tools.map((tool) =>
      link(`/${tool.slug}/`, tool.title, tool.description),
    ),
  ];
  try {
    const posts = await (
      await getDb()
    )
      .collection<CmsRecord>("cms_records")
      .find(
        {
          collection: "content",
          status: "published",
          "data.type": "post",
          "data.robotsIndex": { $ne: false },
          slug: { $regex: "^blog/" },
        },
        { projection: { _id: 0, slug: 1, title: 1, "data.excerpt": 1 } },
      )
      .sort({ title: 1 })
      .toArray();
    if (posts.length)
      lines.push(
        "",
        "## Guides (SEO, AEO, GEO, content and measurement)",
        link("/guides/", "Guide library"),
        ...posts.map((post) =>
          link(
            `/${post.slug.replace(/^\/+|\/+$/g, "")}/`,
            post.title,
            bodyText(String(post.data.excerpt || "")).slice(0, 160) ||
              undefined,
          ),
        ),
      );
  } catch {
    // Database unavailable: serve the static sections only.
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

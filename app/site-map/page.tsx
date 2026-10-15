import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import Link from "next/link";
import { InformationShell } from "@/components/site/information-page";
import { directories } from "@/lib/site/directories";
import { marketplaceGroups } from "@/lib/commerce/marketplace-ranges";
import { buyerGuides } from "@/lib/site/buyer-guides";
import { tools } from "@/lib/tools/catalog";
const baseMetadata: Metadata = {
  robots: { index: true, follow: true },
  title: "Name Retailer Site Map: All Pages and Resources",
  description:
    "Browse every public Name Retailer page: guest posting directories, DA, DR, traffic and price ranges, buying guides, free SEO tools, the journal, and company and policy pages.",
};
type LinkGroup = [title: string, description: string, links: [string, string][]];
const groups: LinkGroup[] = [
  [
    "Marketplace",
    "Browse and compare publications that accept guest posts, with prices and SEO metrics.",
    [
      ["Home", "/"],
      ["Guest posting sites", "/guest-posting-sites/"],
      ["Marketplace views", "/guest-post-marketplace/"],
      ["Guest post prices", "/guest-post-prices/"],
      ["Guest posts by Domain Rating", "/guest-post-by-dr/"],
      ["Services", "/services/"],
      ["How it works", "/how-it-works/"],
    ],
  ],
  [
    "Guest posting directories",
    "Curated lists by topic, region and budget.",
    directories.map((d): [string, string] => [d.label, `/${d.slug}/`]),
  ],
  ...marketplaceGroups.map((group): LinkGroup => [
    group.title,
    group.description,
    group.ranges
      .filter((r) => r.slug !== "guest-posting-sites-under-50")
      .map((r): [string, string] => [r.label, `/${r.slug}/`]),
  ]),
  [
    "Buying guides",
    "Plain-language answers on cost, quality and risk before you buy a link.",
    [
      ["All guides", "/guides/"],
      ["How to buy links", "/how-to-buy-links/"],
      ...buyerGuides
        .filter((g) => g.approved)
        .map((g): [string, string] => [g.title, `/guides/${g.slug}/`]),
    ],
  ],
  [
    "Free SEO tools",
    "Browser-based utilities for writers and link builders.",
    [
      ["All SEO tools", "/seo-tools/"],
      ...tools.map((t): [string, string] => [t.title, `/${t.slug}/`]),
    ],
  ],
  [
    "Journal",
    "SEO, AEO and GEO articles from Name Retailer.",
    [["SEO, AEO & GEO journal", "/blog/"]],
  ],
  [
    "Company and support",
    "About Name Retailer, how we work, and where to get help.",
    [
      ["About", "/about/"],
      ["Methodology", "/methodology/"],
      ["Contact", "/contact/"],
      ["FAQ", "/faq/"],
      ["Help center", "/help-center/"],
      ["Policy information", "/policies/"],
      ["Refund policy", "/refund-policy/"],
      ["Privacy", "/privacy/"],
      ["Cookies", "/cookies/"],
      ["Terms", "/terms/"],
    ],
  ],
];
export default function Page() {
  return (
    <InformationShell
      path="/site-map/"
      title="Find your next destination."
      label="Page directory"
      description="Browse marketplace directories, guides, tools and support pages."
      active="help"
      image="/03_listing_browser_panel.png"
    >
      <div className="reference-information-sections">
        {groups.map(([title, description, links]) => (
          <section className="reference-card" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
            <ul>
              {links.map(([name, href]) => (
                <li key={href}>
                  <Link href={href}>{name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/site-map/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: {
        ...(facets.robots as object),
        ...(baseMetadata.robots as object),
      },
    },
    "/site-map/",
  );
}

import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import Link from "next/link";
export const revalidate = 3600;
import { InformationShell } from "@/components/site/information-page";
import { directories } from "@/lib/site/directories";
import { marketplaceGroups } from "@/lib/commerce/marketplace-ranges";
import { buyerGuides } from "@/lib/site/buyer-guides";
import { tools } from "@/lib/tools/catalog";
import { publicationSitemapLinks } from "@/lib/commerce/publication-profiles";
import { blogIndex } from "@/lib/blog/queries";
import {
  publicationHost,
  publicationPath,
} from "@/lib/commerce/publication-pages";
const baseMetadata: Metadata = {
  robots: { index: true, follow: true },
  title: "Name Retailer Site Map: All Pages and Resources",
  description:
    "Browse every public Name Retailer page: guest posting directories, DA, DR, traffic and price ranges, buying guides, free SEO tools, the journal, and company and policy pages.",
};
type LinkGroup = [
  title: string,
  description: string,
  links: [string, string][],
];
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
    "Broader traffic view",
    "Compare publications above 500,000 supplied monthly visits.",
    [["Traffic above 500,000", "/500k-plus-traffic/"]],
  ],
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
    "Guest posting, editorial writing and campaign measurement articles.",
    [["Guest posting journal", "/blog/"]],
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
export default async function Page() {
  // Link the same eligible profiles advertised by XML, including those beyond
  // the first catalogue pages. Never expose inactive or uncommitted inventory.
  const profiles = await publicationSitemapLinks().catch(() => []);
  const journal = await blogIndex("", "", 1, 60).catch(() => null);
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
              {[
                ...links,
                ...(title === "Journal"
                  ? (journal?.data || []).map(
                      (article) =>
                        [article.title, `/${article.slug}/`] as [
                          string,
                          string,
                        ],
                    )
                  : []),
              ].map(([name, href]) => (
                <li key={href}>
                  <Link href={href}>{name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {profiles.length > 0 && (
          <section className="reference-card">
            <h2>Publication profiles</h2>
            <p>
              Explore eligible publisher profiles, then check each listing’s
              supplied metrics, price and editorial requirements.
            </p>
            <details>
              <summary>
                Browse {profiles.length.toLocaleString("en-US")} publication
                profiles
              </summary>
              <ul>
                {profiles.map((profile) => {
                  const path = publicationPath(profile);
                  return path ? (
                    <li key={path}>
                      <Link href={path} prefetch={false}>
                        {publicationHost(profile.domain)}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </details>
          </section>
        )}
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
        ...(baseMetadata.robots as object),
        ...(facets.robots as object),
      },
    },
    "/site-map/",
  );
}

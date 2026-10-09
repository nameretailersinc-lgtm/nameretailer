import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { InformationShell } from "@/components/site/information-page";
import { DirectoryLinks } from "@/components/site/directory-page";
import { directories } from "@/lib/site/directories";
import { directoryListings } from "@/lib/commerce/products";
import { PublicationTable } from "@/components/site/publication-table";
import { marketplaceGroups } from "@/lib/commerce/marketplace-ranges";
import { canonicalOrigin } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  faqPageNode,
  jsonLdGraph,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

const baseMetadata: Metadata = {
  title: "Guest Posting Sites by Niche, Location and Price",
  description:
    "Browse guest posting sites by niche, country, budget and metrics. Compare technology, SaaS, marketing, business, health and travel publishers.",
};

const evaluation = [
  [
    "Audience fit",
    "Would your customers read this site? Read recent articles and check the topics, tone and comments.",
  ],
  [
    "Editorial quality",
    "Look for named authors, regular publishing, accurate content and articles that are not crowded with unrelated outbound links.",
  ],
  [
    "Supplied metrics",
    "Use DR, DA and traffic to compare sites, but treat them as third-party estimates, not proof of readers or results.",
  ],
  [
    "Placement terms",
    "Check link type, turnaround, content requirements and whether writing is included, so you compare total cost.",
  ],
  [
    "Disclosure",
    "Paid placements should be labelled according to the publisher’s policy and search-engine guidance on sponsored links.",
  ],
] as const;

const faq = [
  [
    "What are guest posting sites?",
    "Guest posting sites are publications that accept articles written by outside contributors, often in exchange for a link or a fee. Name Retailer lists publishers that offer paid placements, with supplied metrics and USD prices.",
  ],
  [
    "How do I choose the right guest posting site?",
    "Start with the audience: pick sites your customers already read. Then check editorial quality, compare supplied metrics and prices, and confirm placement terms and disclosure before ordering.",
  ],
  [
    "Are the metrics independently verified?",
    "No. DR, DA and traffic are supplied by the inventory owner from third-party providers. Missing values are shown as missing, never as zero.",
  ],
] as const;

export default async function Page() {
  await connection();
  const publications = await directoryListings({}, 20);
  const counts = await Promise.all(
    directories.map((directory) =>
      directoryListings(directory.filter, 0)
        .then((result) => result.total)
        .catch(() => null),
    ),
  );
  const url = `${canonicalOrigin}/guest-posting-sites/`;
  const schema = jsonLdGraph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: "Guest posting sites by niche, location and price",
      isPartOf: { "@id": `${canonicalOrigin}/#website` },
      publisher: { "@id": `${canonicalOrigin}/#organization` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: directories.map((directory, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: directory.h1,
          url: `${canonicalOrigin}/${directory.slug}/`,
        })),
      },
    },
    breadcrumbSchema([
      ["Home", "/"],
      ["Guest posting sites", "/guest-posting-sites/"],
    ]),
    faqPageNode(faq),
  );
  return (
    <InformationShell
      title="Guest posting sites by niche, location and budget"
      label="Guest posting sites"
      description="Find publishers that reach your audience. Start with a niche directory, filter by country or price, or compare sites by Domain Authority, Domain Rating and traffic."
      active="marketplace"
      image="/15_laptop_dashboard_illustration.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <section className="reference-information-next" aria-labelledby="niches">
        <h2>Available guest posting publications</h2>
        <PublicationTable products={publications.data} />
        <h2 id="niches">Guest posting sites by niche and audience</h2>
        <div className="reference-three-grid">
          {directories.map((directory, index) => (
            <article className="reference-card" key={directory.slug}>
              <h3>{directory.h1}</h3>
              <p>{directory.lead}</p>
              {typeof counts[index] === "number" && (
                <p className="reference-small">
                  {counts[index]!.toLocaleString("en-US")} active publications
                </p>
              )}
              <Link href={`/${directory.slug}/`}>
                Compare publishers <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="reference-card directory-listings">
        <h2>Guest posting sites by metrics and price</h2>
        <p>
          Each view below is a fixed range of the live inventory. Missing
          metrics are excluded rather than counted as zero.
        </p>
        <div className="directory-range-groups">
          {marketplaceGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul className="directory-link-list">
                {group.ranges.map((range) => (
                  <li key={range.slug}>
                    <Link href={`/${range.slug}/`}>{range.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p>
          Or <Link href="/">browse every publication in the marketplace</Link>{" "}
          and combine filters for topic, country, language, metrics and price.
        </p>
      </section>
      <section className="reference-card" aria-labelledby="evaluate">
        <h2 id="evaluate">How to evaluate guest post sites</h2>
        <ol>
          {evaluation.map(([title, body]) => (
            <li key={title}>
              <strong>{title}.</strong> {body}
            </li>
          ))}
        </ol>
        <p>
          The <Link href="/how-to-buy-links/">guest-post buying guide</Link>{" "}
          walks through each step in more detail.
        </p>
      </section>
      <section
        className="reference-tool-faq reference-information-next"
        aria-labelledby="hub-faq"
      >
        <h2 id="hub-faq">Common questions about guest posting sites</h2>
        {faq.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <DirectoryLinks />
    </InformationShell>
  );
}

export async function generateMetadata({searchParams}: {searchParams: Promise<SearchParams>}) {const facets=facetMetadata("/guest-posting-sites/",await searchParams);return pageMetadata({...baseMetadata, alternates: facets.alternates, robots: {...facets.robots as object,...baseMetadata.robots as object}},"/guest-posting-sites/");}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { InformationShell } from "./information-page";
import { directoryListings } from "@/lib/commerce/products";
import { directories, type Directory } from "@/lib/site/directories";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { DirectorySummary } from "./directory-summary";
import { itemListNode } from "@/lib/seo/json-ld";
import {
  faqPageNode,
  jsonLdGraph,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

const number = (value: number | null | undefined) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "—";
const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const host = (domain: string) => {
  try {
    return new URL(domain).hostname.replace(/^www\./, "");
  } catch {
    return domain;
  }
};

async function listings(directory: Directory) {
  try {
    return await directoryListings(directory.filter);
  } catch {
    return null;
  }
}

/** Plain HTML links between the directory hub, niche pages, tools and guides. */
export function DirectoryLinks({ exclude }: { exclude?: string }) {
  return (
    <section className="reference-information-next" aria-label="Explore more">
      <p className="eyebrow">Keep exploring</p>
      <div className="reference-three-grid">
        <article className="reference-card">
          <h2>Publishers by niche</h2>
          <ul className="directory-link-list">
            <li>
              <Link href="/guest-posting-sites/">All guest posting sites</Link>
            </li>
            {directories
              .filter((directory) => directory.slug !== exclude)
              .map((directory) => (
                <li key={directory.slug}>
                  <Link href={`/${directory.slug}/`}>{directory.h1}</Link>
                </li>
              ))}
          </ul>
        </article>
        <article className="reference-card">
          <h2>Free SEO tools</h2>
          <ul className="directory-link-list">
            <li>
              <Link href="/bulk-domain-rating-checker/">
                Bulk Domain Rating checker
              </Link>
            </li>
            <li>
              <Link href="/keyword-density-checker/">
                Keyword density checker
              </Link>
            </li>
            <li>
              <Link href="/competitor-backlink-analyzer/">
                Competitor backlink analyzer
              </Link>
            </li>
            <li>
              <Link href="/schema-markup-validator/">
                Schema markup validator
              </Link>
            </li>
            <li>
              <Link href="/seo-tools/">All free tools</Link>
            </li>
          </ul>
        </article>
        <article className="reference-card">
          <h2>Learn before you buy</h2>
          <ul className="directory-link-list">
            <li>
              <Link href="/how-to-buy-links/">
                How to evaluate guest post sites
              </Link>
            </li>
            <li>
              <Link href="/blog/a-practical-guest-post-budget-worksheet/">
                A practical guest-post budget worksheet
              </Link>
            </li>
            <li>
              <Link href="/blog/an-editorial-review-checklist-for-a-publication-shortlist/">
                Editorial review checklist for a shortlist
              </Link>
            </li>
            <li>
              <Link href="/how-it-works/">How Name Retailer works</Link>
            </li>
            <li>
              <Link href="/guides/">All guides</Link>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export async function DirectoryPage({ directory }: { directory: Directory }) {
  const result = await listings(directory);
  const stats = await catalogueSummary("", directory.slug);
  const url = `${canonicalOrigin}/${directory.slug}/`;
  const schema = jsonLdGraph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: directory.h1,
      description: directory.metaDescription,
      isPartOf: { "@id": `${canonicalOrigin}/#website` },
      publisher: { "@id": `${canonicalOrigin}/#organization` },
      ...(result?.data.length
        ? {
            mainEntity: itemListNode(result.data),
          }
        : {}),
    },
    faqPageNode(directory.faq),
  );
  const related = directory.related
    .map((slug) => directories.find((item) => item.slug === slug))
    .filter((item): item is Directory => !!item);
  return (
    <InformationShell
      path={`/${directory.slug}/`}
      title={directory.h1}
      label={directory.label}
      parent={["Guest posting sites", "/guest-posting-sites/"]}
      description={directory.lead}
      active="marketplace"
      image="/03_listing_browser_panel.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <section className="reference-card directory-listings">
        <h2>Publishers in this directory</h2>
        {result ? (
          <>
            <p>
              <strong>{number(result.total)}</strong> active publications
              {result.lowestPriceCents !== null
                ? `, with placements from ${usd(result.lowestPriceCents)}`
                : ""}
              . The {Math.min(result.data.length, result.total)} below have the
              highest supplied Domain Rating. Metrics are supplied estimates; a
              dash means the value was not supplied.
            </p>
            {result.data.length > 0 && (
              <div className="directory-table-wrap">
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th scope="col">Publication</th>
                      <th scope="col">Category</th>
                      <th scope="col">Country</th>
                      <th scope="col">DR</th>
                      <th scope="col">DA</th>
                      <th scope="col">Traffic</th>
                      <th scope="col">Price (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((product) => (
                      <tr key={product.id}>
                        <th scope="row"><a href={product.domain} rel="nofollow noopener noreferrer" target="_blank">{host(product.domain)}</a></th>
                        <td>{product.category}</td>
                        <td>{product.country}</td>
                        <td>{number(product.metrics?.dr)}</td>
                        <td>{number(product.metrics?.da)}</td>
                        <td>{number(product.metrics?.traffic)}</td>
                        <td>{usd(product.priceCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p>
            Listings could not load right now. Browse the marketplace below.
          </p>
        )}
        <h3>Compare the full list in the marketplace</h3>
        <ul className="directory-link-list">
          {directory.browse.map(([label, href]) => (
            <li key={href}>
              <Link href={href}>
                {label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className="reference-information-sections">
        <DirectorySummary label={directory.h1} stats={stats} />
        {directory.sections.map((section) => (
          <section className="reference-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <section className="reference-card">
          <h2>Before you add a placement</h2>
          <ul>
            {directory.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Read the full{" "}
            <Link href="/how-to-buy-links/">
              guide to evaluating guest post sites
            </Link>
            .
          </p>
        </section>
      </div>
      <section
        className="reference-tool-faq reference-information-next"
        aria-labelledby="directory-faq"
      >
        <h2 id="directory-faq">Common questions</h2>
        {directory.faq.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <section className="reference-information-next" aria-label="Related">
        <p className="eyebrow">Related directories</p>
        <div className="reference-three-grid">
          {related.map((item) => (
            <article className="reference-card" key={item.slug}>
              <h2>{item.h1}</h2>
              <p>{item.lead}</p>
              <Link href={`/${item.slug}/`}>
                Compare publishers <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <DirectoryLinks exclude={directory.slug} />
    </InformationShell>
  );
}

/** Crawlable introduction and links shown under the marketplace landing page. */
export function LandingExplore() {
  return (
    <section className="landing-explore" aria-labelledby="landing-explore">
      <div className="reference-card">
        <h2 id="landing-explore">
          Compare guest posting sites before you commit
        </h2>
        <p>
          Name Retailer is a guest post marketplace for brands, agencies and SEO
          teams. Every listing shows the publication’s topic, audience country
          and language, supplied Domain Authority, Domain Rating and traffic
          estimates, and a USD placement price, so you can judge audience fit
          and value side by side instead of across scattered spreadsheets.
        </p>
        <p>
          Start with a niche directory below, open a{" "}
          <Link href="/guest-posting-sites/">
            guest posting sites directory
          </Link>{" "}
          by metric or budget, or use the filters above to build your own
          shortlist.
        </p>
      </div>
      <DirectoryLinks />
    </section>
  );
}

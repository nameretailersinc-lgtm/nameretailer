import Link from "next/link";
import { InformationShell } from "@/components/site/information-page";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { PROFILE_RULE } from "@/lib/commerce/publication-pages";
import {
  MIN_INDEXABLE_LISTINGS,
  MIN_INDEXABLE_WORDS,
} from "@/lib/site/range-copy";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return pageMetadata(
    {
      title: "Listing and Metrics Methodology",
      description:
        "How Name Retailer sources guest post listings, what DA, DR, traffic and spam score mean, how missing values and price statistics are handled.",
      ...facetMetadata("/methodology/", await searchParams),
    },
    "/methodology/",
  );
}

const fields: Array<[string, string]> = [
  [
    "Domain Authority (DA)",
    "Moz’s 1–100 score predicting how likely a domain is to rank, based mainly on links. Supplied with the listing.",
  ],
  [
    "Domain Rating (DR)",
    "Ahrefs’ 0–100 measure of backlink-profile strength relative to other sites in its index. Supplied with the listing.",
  ],
  [
    "Traffic",
    "An estimate of monthly organic visits supplied with the listing. The tool and measurement date are not always stated; ask before relying on it.",
  ],
  [
    "Spam score",
    "A supplied risk score where lower is better. Ask which provider measured it.",
  ],
  [
    "Placement price",
    "The publisher’s USD price for the placement only. Article writing, where offered, is a separate 500-, 750- or 1,000-word charge.",
  ],
  [
    "Topic, country, language",
    "Supplied classifications. Country describes the listing, not verified audience geography.",
  ],
];

export default function Page() {
  return (
    <InformationShell
      path="/methodology/"
      parent={["About", "/about/"]}
      title="How we source listings and metrics"
      label="Methodology"
      description="Every number on Name Retailer comes from publisher-supplied listings or from statistics calculated over the active catalogue. This page explains each field, what we check, what we don’t, and how we decide which pages search engines should index."
      active="about"
      image="/02_content_metrics_panel.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${canonicalOrigin}/methodology/#page`,
            url: `${canonicalOrigin}/methodology/`,
            name: "Listing and metrics methodology",
            isPartOf: { "@id": `${canonicalOrigin}/#website` },
            publisher: { "@id": `${canonicalOrigin}/#organization` },
          }),
        }}
      />
      <div className="reference-information-sections">
        <section className="reference-card">
          <h2>Where do listings come from?</h2>
          <p>
            Listings are imported from publisher-supplied inventory. Each import
            is validated field by field before it is activated. Rows with
            placeholder values, invalid URLs or prices, or data that conflicts
            with an existing listing are excluded rather than published. Only
            listings in an active, committed import appear in the marketplace.
          </p>
        </section>
        <section className="reference-card">
          <h2>What does each field mean?</h2>
          <dl className="publication-facts">
            {fields.map(([term, text]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <p>
            None of these metrics is independently re-measured by Name Retailer.
            A dash or “Not provided” means the value was not supplied; it is
            never treated as zero, and listings without a value are left out of
            range filters for that metric. A listing’s update date records when
            the listing changed, not when a provider measured its metrics.
          </p>
        </section>
        <section className="reference-card">
          <h2>How are catalogue statistics calculated?</h2>
          <p>
            Price ranges, medians and counts on guides and directory pages are
            calculated live over every active listing that matches the page,
            never only the visible page of results, and refreshed at most every
            15 minutes. The{" "}
            <Link href="/guides/guest-post-cost/">guest post cost guide</Link>{" "}
            reports the median and the 25th–75th percentile range for each
            group, and leaves out groups with fewer than 15 listings.
          </p>
        </section>
        <section className="reference-card">
          <h2>Which publications get a profile page?</h2>
          <p>
            A publication gets its own profile page only when its supplied data
            is complete and strong: estimated traffic of at least{" "}
            {PROFILE_RULE.minTraffic.toLocaleString("en-US")} monthly visits, DR{" "}
            {PROFILE_RULE.minDr} or higher, DA {PROFILE_RULE.minDa} or higher, a
            spam score of {PROFILE_RULE.maxSpamScore} or lower, a specific
            topic, and a root-domain URL. This is a data threshold, not an
            editorial endorsement. Every other listing stays available in the
            marketplace.
          </p>
        </section>
        <section className="reference-card">
          <h2>Which pages do we ask search engines to index?</h2>
          <p>
            A metric or price range page is indexed only when it has at least{" "}
            {MIN_INDEXABLE_LISTINGS} active listings and at least{" "}
            {MIN_INDEXABLE_WORDS} words of page-specific explanation. Filtered
            and sorted marketplace views are not indexed.
          </p>
        </section>
        <section className="reference-card">
          <h2>What we do not claim</h2>
          <p>
            We do not guarantee rankings, traffic or link value from any
            placement, and payment does not change how a publisher labels
            sponsored content. Read{" "}
            <Link href="/guides/vet-a-guest-post-site/">
              how to vet a guest post site
            </Link>{" "}
            before ordering, and <Link href="/contact/">contact us</Link> if a
            listing looks wrong.
          </p>
        </section>
      </div>
    </InformationShell>
  );
}

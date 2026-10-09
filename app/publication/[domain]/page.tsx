import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { InformationShell } from "@/components/site/information-page";
import { BuyPlacement } from "@/components/cart/buy-placement";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import {
  publicationPath,
  publicationHost,
  validPublicationSlug,
} from "@/lib/commerce/publication-pages";
import {
  publicationProfile,
  relatedProfiles,
} from "@/lib/commerce/publication-profiles";
import type { PublicProduct } from "@/lib/commerce/types";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

type Props = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<SearchParams>;
};

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
const number = (value: number) => value.toLocaleString("en-US");
const date = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

async function load(params: Props["params"]) {
  const slug = (await params).domain;
  if (!validPublicationSlug(slug)) notFound();
  await connection();
  const product = await publicationProfile(slug);
  if (!product) notFound();
  return {
    host: publicationHost(product.domain)!,
    path: publicationPath(product)!,
    product,
  };
}

/** Compares this listing's price with a median, in words a buyer can reuse. */
function priceComparison(priceCents: number, medianCents: number | null) {
  if (medianCents === null || medianCents <= 0) return null;
  const ratio = priceCents / medianCents;
  if (ratio > 0.95 && ratio < 1.05) return "about the same as";
  if (ratio >= 2)
    return `about ${ratio < 10 ? ratio.toFixed(1) : Math.round(ratio)} times`;
  return ratio > 1
    ? `${Math.round((ratio - 1) * 100)}% above`
    : `${Math.round((1 - ratio) * 100)}% below`;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { host, path, product } = await load(params);
  const { dr, traffic } = product.metrics;
  return pageMetadata(
    {
      title: `${host} Guest Post: Price, DR and Traffic`,
      description: `Guest post on ${host} (${product.category}, ${product.country}): ${usd(product.priceCents)} placement, supplied DR ${dr} and about ${number(traffic ?? 0)} monthly visits. Compare before you order.`,
      ...facetMetadata(path, await searchParams),
    },
    path,
  );
}

function Fact({ term, value }: { term: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { host, path, product } = await load(params);
  const [topic, catalogue, related] = await Promise.all([
    catalogueSummary(
      new URLSearchParams({ category: product.category }).toString(),
    ).catch(() => null),
    catalogueSummary("").catch(() => null),
    relatedProfiles(product).catch((): PublicProduct[] => []),
  ]);
  const m = product.metrics;
  const topicComparison = topic
    ? priceComparison(product.priceCents, topic.medianPriceCents)
    : null;
  const catalogueComparison = catalogue
    ? priceComparison(product.priceCents, catalogue.medianPriceCents)
    : null;
  const url = canonicalOrigin + path;
  const lead = `${host} is listed in the ${product.category} topic for ${product.country}, publishing in ${product.language}. A placement costs ${usd(product.priceCents)}, and the publisher supplied a Domain Rating of ${m.dr}, Domain Authority of ${m.da} and roughly ${number(m.traffic ?? 0)} estimated monthly visits.`;
  return (
    <InformationShell
      path={path}
      parent={["Guest posting sites", "/guest-posting-sites/"]}
      title={`Guest post on ${host}`}
      label={host}
      description={lead}
      active="marketplace"
      image="/03_listing_browser_panel.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${url}#page`,
            url,
            name: `Guest post on ${host}`,
            description: lead,
            isPartOf: { "@id": `${canonicalOrigin}/#website` },
            about: { "@type": "WebSite", name: host, url: product.domain },
            dateModified: product.updatedAt,
          }),
        }}
      />
      <section className="reference-card" aria-labelledby="listing-facts">
        <h2 id="listing-facts">Listing details</h2>
        <dl className="publication-facts">
          <Fact term="Topic" value={product.category} />
          <Fact term="Country" value={product.country} />
          <Fact term="Language" value={product.language} />
          <Fact term="Placement price" value={usd(product.priceCents)} />
          <Fact term="Links included" value={product.linkType} />
          <Fact term="Turnaround" value={product.turnaround} />
          <Fact term="Domain Rating (Ahrefs)" value={String(m.dr)} />
          <Fact term="Domain Authority (Moz)" value={String(m.da)} />
          <Fact
            term="Estimated monthly traffic"
            value={m.traffic === null ? null : number(m.traffic)}
          />
          <Fact term="Spam score" value={String(m.spamScore)} />
          <Fact
            term="Referring domains"
            value={
              m.referringDomains === null ? null : number(m.referringDomains)
            }
          />
          <Fact term="Listing record updated" value={date(product.updatedAt)} />
        </dl>
        {product.requirements && (
          <p>
            <strong>Publisher requirements:</strong> {product.requirements}
          </p>
        )}
        <p>
          All metrics are supplied with the listing and are not independently
          verified by Name Retailer. The record date shows when the listing
          changed, not when a provider measured the metric.{" "}
          <Link href="/methodology/">How listings and metrics are sourced</Link>
          .
        </p>
        <div className="publication-actions">
          <BuyPlacement productId={product.id} />
          <a
            href={product.domain}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            Visit {host} <ArrowUpRight size={14} aria-hidden="true" />
            <span className="screen-reader-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
      {(topicComparison || catalogueComparison) && (
        <section className="reference-card" aria-labelledby="price-context">
          <h2 id="price-context">How does this price compare?</h2>
          {topic && topicComparison && topic.medianPriceCents !== null && (
            <p>
              This placement is <strong>{topicComparison}</strong> the median{" "}
              {product.category} listing ({usd(topic.medianPriceCents)} across{" "}
              {number(topic.total)} active {product.category} publications).
            </p>
          )}
          {catalogue &&
            catalogueComparison &&
            catalogue.medianPriceCents !== null && (
              <p>
                Across the whole catalogue it is{" "}
                <strong>{catalogueComparison}</strong> the median placement
                price of {usd(catalogue.medianPriceCents)}.
              </p>
            )}
          <p>
            Price alone does not show value. Read the guide to{" "}
            <Link href="/guides/guest-post-cost/">guest post costs</Link> for
            what a placement price includes.
          </p>
        </section>
      )}
      <section className="reference-card" aria-labelledby="before-ordering">
        <h2 id="before-ordering">What to check before ordering</h2>
        <ul>
          <li>
            Read recent {host} articles and confirm your topic fits the{" "}
            {product.category} coverage.
          </li>
          <li>
            Ask whether the placement is a new article or a link insertion and
            what the price covers.
          </li>
          <li>
            Agree how sponsored content is labelled and whether links use
            rel=&quot;sponsored&quot;.
          </li>
          <li>Ask which provider measured the traffic estimate, and when.</li>
        </ul>
        <p>
          The full checklist is in{" "}
          <Link href="/guides/vet-a-guest-post-site/">
            how to vet a guest post site
          </Link>
          .
        </p>
      </section>
      {related.length > 0 && (
        <section
          className="reference-card"
          aria-labelledby="related-publications"
        >
          <h2 id="related-publications">
            Other {product.category} publications to compare
          </h2>
          <ul className="directory-link-list">
            {related.map((item) => {
              const href = publicationPath(item);
              if (!href) return null;
              return (
                <li key={item.id}>
                  <Link href={href}>{publicationHost(item.domain)}</Link> · DR{" "}
                  {item.metrics.dr} · {usd(item.priceCents)}
                </li>
              );
            })}
          </ul>
          <p>
            <Link href="/guest-posting-sites/">
              Browse all guest posting sites by niche
            </Link>
            .
          </p>
        </section>
      )}
    </InformationShell>
  );
}

import { DataDisclosure, validAsOf } from "@/components/site/data-disclosure";
import { finishedCopy } from "@/lib/site/public-copy";
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
  validPublicationListingId,
} from "@/lib/commerce/publication-pages";
import {
  publicationProfile,
  publicationIndexable,
  relatedProfiles,
} from "@/lib/commerce/publication-profiles";
import { publicationInsights } from "@/lib/commerce/publication-insights";
import type { PublicProduct } from "@/lib/commerce/types";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

type Props = {
  params: Promise<{ domain: string; listing?: string }>;
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
  const { domain: slug, listing } = await params;
  if (!validPublicationSlug(slug)) notFound();
  if (listing !== undefined && !validPublicationListingId(listing)) notFound();
  await connection();
  const product = await publicationProfile(slug, listing);
  if (!product) notFound();
  return {
    host: publicationHost(product.domain, false)!,
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
  const facts = [
    `${usd(product.priceCents)} placement`,
    dr !== null ? `supplied DR ${dr}` : null,
    traffic !== null ? `about ${number(traffic)} monthly visits` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const facets = facetMetadata(path, await searchParams);
  return pageMetadata(
    {
      title: `${host} Guest Post: Price, DR and Traffic`,
      description: `Guest post on ${host}: ${facts}. Compare listing details before you order.`,
      ...facets,
      robots: (await publicationIndexable(product))
        ? facets.robots
        : { index: false, follow: true },
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
  const [topic, catalogue, related, insights] = await Promise.all([
    catalogueSummary(
      new URLSearchParams({ category: product.category }).toString(),
    ).catch(() => null),
    catalogueSummary("").catch(() => null),
    relatedProfiles(product).catch((): PublicProduct[] => []),
    publicationInsights(product).catch(() => null),
  ]);
  const m = product.metrics;
  const topicComparison =
    topic && validAsOf(topic.updatedAt)
      ? priceComparison(product.priceCents, topic.medianPriceCents)
      : null;
  const catalogueComparison =
    catalogue && validAsOf(catalogue.updatedAt)
      ? priceComparison(product.priceCents, catalogue.medianPriceCents)
      : null;
  const url = canonicalOrigin + path;
  const suppliedMetrics = [
    m.dr !== null ? `a Domain Rating of ${m.dr}` : null,
    m.da !== null ? `a Domain Authority of ${m.da}` : null,
    m.traffic !== null
      ? `roughly ${number(m.traffic)} estimated monthly visits`
      : null,
  ].filter(Boolean);
  const lead = `${host} is listed${product.category ? ` in the ${product.category} topic` : ""}${product.country ? ` for ${product.country}` : ""}${product.language ? `, publishing in ${product.language}` : ""}. A placement costs ${usd(product.priceCents)}.${suppliedMetrics.length ? ` The publisher supplied ${suppliedMetrics.join(", ")}.` : ""}`;
  const per100k = insights ? insights.centsPer100kVisits : null;
  const turnaroundNote =
    product.turnaround && insights?.topicMedianTurnaroundDays != null
      ? `${product.turnaround} against a ${product.category} median of about ${Math.round(insights.topicMedianTurnaroundDays)} days`
      : product.turnaround || null;
  const faq: Array<[string, string]> = [
    [
      `How much does a guest post on ${host} cost?`,
      `A placement on ${host} is listed at ${usd(product.priceCents)}.${topicComparison && topic?.medianPriceCents ? ` That is ${topicComparison} the ${usd(topic.medianPriceCents)} median for ${product.category} listings.` : ""} Check what the price covers before ordering.`,
    ],
    [
      `What are the Domain Rating and traffic of ${host}?`,
      `The listing supplies ${suppliedMetrics.length ? suppliedMetrics.join(", ") : "no metrics"}. These figures come with the listing and are not independently verified by Name Retailer.`,
    ],
    [
      `Which topic and audience does ${host} cover?`,
      `${host} is listed in ${product.category}, for ${product.country}, publishing in ${product.language}.`,
    ],
    ...(turnaroundNote
      ? ([
          [
            `How long does a placement on ${host} take?`,
            `The listing states a turnaround of ${turnaroundNote}.`,
          ],
        ] as Array<[string, string]>)
      : []),
  ];
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: faq.map(([name, text]) => ({
              "@type": "Question",
              name,
              acceptedAnswer: { "@type": "Answer", text },
            })),
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
          <Fact
            term="Domain Rating (Ahrefs)"
            value={m.dr === null ? null : String(m.dr)}
          />
          <Fact
            term="Domain Authority (Moz)"
            value={m.da === null ? null : String(m.da)}
          />
          <Fact
            term="Estimated monthly traffic"
            value={m.traffic === null ? null : number(m.traffic)}
          />
          <Fact
            term="Spam score"
            value={m.spamScore === null ? null : String(m.spamScore)}
          />
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
            <strong>Publisher requirements:</strong>{" "}
            {finishedCopy(product.requirements)}
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
      {insights && insights.topicTotal > 1 && (
        <section className="reference-card" aria-labelledby="how-it-ranks">
          <h2 id="how-it-ranks">How {host} compares in {product.category}</h2>
          <p>
            Among {number(insights.topicTotal)} active {product.category}{" "}
            listings, {host} ranks <strong>#{number(insights.topicTrafficRank)}</strong>{" "}
            for estimated traffic and sits above{" "}
            <strong>{insights.topicDrPercentile}%</strong> of them on Domain
            Rating. Across all {number(insights.catalogueTotal)} active
            listings its traffic rank is #{number(insights.catalogueTrafficRank)}.
          </p>
          <p>
            Its placement costs {usd(product.priceCents)}, which is cheaper
            than {insights.topicCheaperThanPercent}% of {product.category}{" "}
            listings
            {per100k !== null && (
              <>
                {" "}
                and works out to about{" "}
                <strong>{usd(Math.round(per100k))}</strong> per 100,000
                estimated monthly visits
                {insights.topicMedianCentsPer100kVisits !== null && (
                  <>
                    {" "}
                    (topic median:{" "}
                    {usd(Math.round(insights.topicMedianCentsPer100kVisits))})
                  </>
                )}
              </>
            )}
            .{turnaroundNote && <> Stated turnaround: {turnaroundNote}.</>}
          </p>
          {insights.peers.length > 0 && (
            <>
              <h3>Similar publications (DR within 5 points)</h3>
              <ul className="directory-link-list">
                {insights.peers.map((peer) => {
                  const href = publicationPath(peer);
                  const peerHost = publicationHost(peer.domain, false);
                  if (!href || !peerHost) return null;
                  return (
                    <li key={peer.id}>
                      <Link href={href}>{peerHost}</Link> · DR{" "}
                      {peer.metrics.dr} · {usd(peer.priceCents)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <p>
            Rankings use the supplied metrics and the active catalogue at the
            time of the request; they are comparisons, not quality ratings.
          </p>
        </section>
      )}
      <section className="reference-card" aria-labelledby="publication-faq">
        <h2 id="publication-faq">Questions about {host}</h2>
        {faq.map(([question, answer]) => (
          <div key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}
      </section>
      {(topicComparison || catalogueComparison) && (
        <section className="reference-card" aria-labelledby="price-context">
          <h2 id="price-context">How does this price compare?</h2>
          {topicComparison && <DataDisclosure asOf={topic?.updatedAt} />}
          {catalogueComparison && (
            <DataDisclosure asOf={catalogue?.updatedAt} />
          )}
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

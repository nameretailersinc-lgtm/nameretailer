import { DataDisclosure, validAsOf } from "@/components/site/data-disclosure";
import "./hub.css";
import Link from "next/link";
import { Suspense } from "react";
export const revalidate = 3600;
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Cpu,
  Flag,
  HeartPulse,
  Megaphone,
  Plane,
  type LucideIcon,
} from "lucide-react";
import { InformationShell } from "@/components/site/information-page";
import { PublicationTable } from "@/components/site/publication-table";
import { directories } from "@/lib/site/directories";
import { guestPostingHubUpdatedAt } from "@/lib/site/editorial";
import { productFacets } from "@/lib/commerce/products";
import { publicHubListings } from "@/lib/commerce/public-directory";
import { CatalogueRetry } from "@/components/site/catalogue-retry";
import {
  catalogueSummary,
  directorySummaries,
  hubPriceSummary,
} from "@/lib/commerce/catalogue-summary";
import { cachedAsync } from "@/lib/cache/ttl";
import { marketplaceGroups } from "@/lib/commerce/marketplace-ranges";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { itemListNode } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import {
  faqPageNode,
  jsonLdGraph,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents < 1000 ? 2 : 0,
  }).format(cents / 100);
const count = (value: number) => value.toLocaleString("en-US");





const nicheIcons: Record<string, LucideIcon> = {
  "technology-guest-posting-sites": Cpu,
  "saas-guest-posting-sites": Code2,
  "guest-posting-sites-usa": Flag,
  "marketing-guest-posting-sites": Megaphone,
  "business-guest-posting-sites": BriefcaseBusiness,
  "health-guest-posting-sites": HeartPulse,
  "travel-lifestyle-guest-posting-sites": Plane,
};

/** Reader-facing names for the metric groups in lib/commerce/marketplace-ranges.ts. */
const groupNames: Record<string, [title: string, note: string]> = {
  "By Domain Authority (DA)": ["Domain Authority", "Moz score, 1–100"],
  "Guest Posts By Traffic": ["Monthly traffic", "Supplied estimate"],
  "Guest Posts By DR": ["Domain Rating", "Ahrefs score, 0–100"],
  "Guest Posts By Price": ["Placement price", "USD, placement only"],
};

const steps = [
  [
    "Start with the audience",
    "Pick sites your customers already read. Check recent articles for topic, tone and the country and language you need.",
  ],
  [
    "Check editorial quality",
    "Look for named authors, regular publishing and accurate articles that are not crowded with unrelated outbound links.",
  ],
  [
    "Compare metrics consistently",
    "Use one authority score (DA or DR) plus traffic to rank a shortlist. They are third-party estimates, not proof of readers.",
  ],
  [
    "Confirm placement terms",
    "Check link type, turnaround, content requirements and whether writing is extra, so you compare the total cost.",
  ],
  [
    "Agree disclosure",
    'Paid placements should be labelled as sponsored, and Google asks for paid links to use rel="sponsored" or nofollow.',
  ],
] as const;

type Stats = Awaited<ReturnType<typeof catalogueSummary>>;

function faqFor(stats: Stats | null) {
  const median =
    stats?.medianPriceCents != null && validAsOf(stats.updatedAt)
      ? usd(stats.medianPriceCents)
      : null;
  return [
    [
      "How do I find a guest post marketplace?",
      "Start with a marketplace that lists publications by topic, country and language, then narrow the directory to your audience and budget. Open each publication profile to review requirements and supplied metrics. On Name Retailer, use the niche directories and price bands to build a shortlist before contacting the team.",
    ],
    [
      "How do I choose a guest post marketplace?",
      "Choose a marketplace that explains its catalogue sources, metric limitations, placement prices and contact process. Check whether publication requirements, sponsorship disclosure and link qualification are clear. Ask how terms are confirmed and what happens if a placement cannot proceed. Treat broad promises of rankings or guaranteed traffic as claims requiring evidence.",
    ],
    [
      "How do I compare websites for guest posts?",
      "Compare audience relevance first, then country, language, recent articles and editorial standards. Use the same authority metric across your shortlist and ask for the source and date of traffic estimates. Compare placement and writing costs separately, and confirm link qualification, disclosure and turnaround with the publisher before committing to a placement.",
    ],
    [
      "What are guest posting sites?",
      "Guest posting sites are publications that accept articles from outside contributors. Name Retailer lists supplied placement offers with their topic, country, metrics and USD asking price so you can compare them side by side. A listing does not confirm publisher authorization or current availability.",
    ],
    [
      "How much does a guest post cost?",
      median && stats
        ? `Across ${count(stats.total)} active listings the median placement price is ${median}. Prices depend on the publication’s audience, authority and topic, and article writing is charged separately where offered. See the cost guide for medians by DA, DR, country and topic.`
        : "Prices depend on the publication’s audience, authority and topic, and article writing is charged separately where offered. See the cost guide for medians by DA, DR, country and topic.",
    ],
    [
      "How do I choose the right guest posting site?",
      "Start with the audience: choose sites your customers already read. Then check editorial quality, compare one authority score and traffic consistently, and confirm placement terms and sponsored disclosure. Online ordering and payment are currently disabled; saving a plan does not reserve a placement.",
    ],
    [
      "Are paid guest posts allowed by Google?",
      'Sponsored content is allowed when it is labelled and its links are qualified. Google asks for paid links to use rel="sponsored" or nofollow; its spam policies target paid links meant to pass ranking credit.',
    ],
    [
      "What is the difference between DA and DR?",
      "Domain Authority (DA) is Moz’s 1–100 score and Domain Rating (DR) is Ahrefs’ 0–100 score. Both are based mainly on links, but they come from different indexes, so compare each only with the same metric.",
    ],
    [
      "Are the metrics on Name Retailer verified?",
      "No. DA, DR and traffic are supplied with each listing from third-party providers and are not independently re-measured. Missing values are shown as missing, never as zero.",
    ],
    [
      "What is the difference between a guest post and a link insertion?",
      "A guest post is a new article published on the site; a link insertion adds your link to an article that already exists. Ask the publisher which formats they offer and what the price covers.",
    ],
  ] as const;
}

async function HubNicheFacts({
  niches,
  index,
}: {
  niches: Promise<Awaited<ReturnType<typeof directorySummaries>> | null>;
  index: number;
}) {
  const niche = (await niches)?.[index];
  if (!niche || !validAsOf(niche.updatedAt) || niche.total < 1) return null;
  return (
    <ul className="hub-niche-facts">
      <li>
        <strong>{count(niche.total)}</strong> sites
      </li>
      {niche.minPriceCents !== null && (
        <li>
          from <strong>{usd(niche.minPriceCents)}</strong>
        </li>
      )}
      {niche.medianPriceCents !== null && (
        <li>
          median <strong>{usd(niche.medianPriceCents)}</strong>
        </li>
      )}
    </ul>
  );
}

function HubPrices({
  datedStats,
  prices,
}: {
  datedStats: Stats | null;
  prices: Awaited<ReturnType<typeof hubPriceSummary>> | null;
}) {
  const breakdown = prices;
  if (!breakdown || !validAsOf(breakdown.asOf) || !breakdown.byTopic.length) {
    return (
      <section className="hub-section" aria-labelledby="prices">
        <h2 id="prices">What does a guest post cost by niche?</h2>
        <p role="status">
          Current price statistics are temporarily unavailable. Please try
          again.
        </p>
        <CatalogueRetry />
      </section>
    );
  }
  return (
    <section className="hub-section" aria-labelledby="prices">
      <div className="hub-heading">
        <p className="eyebrow">Live price data</p>
        <h2 id="prices">What does a guest post cost by niche?</h2>
        <DataDisclosure asOf={breakdown.asOf} />
        {datedStats?.medianPriceCents != null && (
          <p>
            The median placement price across {count(datedStats.total)} active
            listings is <strong>{usd(datedStats.medianPriceCents)}</strong>.
            Medians by topic are below; writing is charged separately where
            offered.
          </p>
        )}
      </div>
      <div className="directory-table-wrap">
        <table className="directory-table">
          <caption>
            Placement price by topic: active listings, median and middle half of
            prices in USD
          </caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Listings</th>
              <th scope="col">Median price</th>
              <th scope="col">Typical range</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.byTopic.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{count(row.count)}</td>
                <td>{usd(row.medianCents)}</td>
                <td>
                  {usd(row.lowCents)}–{usd(row.highCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hub-note">
        Typical range is the 25th to 75th percentile. Prices by DA, DR and
        country are in the{" "}
        <Link href="/guides/guest-post-cost/">guest post cost guide</Link>.
      </p>
    </section>
  );
}

const facetsCache = {
  ttlMs: 15 * 60_000,
  staleOnErrorMs: 24 * 60 * 60_000,
  timeoutMs: 12_000,
  staleWhileRevalidate: true,
};

async function loadHub() {
  const niches = directorySummaries().catch(() => null);
  const prices = hubPriceSummary().catch(() => null);
  const [stats, facets, top, priceData] = await Promise.all([
    catalogueSummary("").catch(() => null),
    cachedAsync("facets", facetsCache, productFacets).catch(() => null),
    publicHubListings().catch(() => null),
    prices,
  ]);
  return { stats, facets, top, niches, prices: priceData };
}

export default async function Page() {
  const { stats, facets, top, niches, prices } = await loadHub();
  const datedStats = validAsOf(stats?.updatedAt) ? stats : null;
  const faq = faqFor(datedStats);
  const url = `${canonicalOrigin}/guest-posting-sites/`;
  const list = top ? itemListNode(top.data) : null;
  const lead = datedStats
    ? `Guest posting sites are publications that accept articles from outside contributors. Compare ${count(datedStats!.total)} active publishers by niche, country, Domain Rating, traffic and USD price, then shortlist the ones your audience actually reads.`
    : "Guest posting sites are publications that accept articles from outside contributors. Compare publishers by niche, country, Domain Rating, traffic and USD price, then shortlist the ones your audience actually reads.";
  const schema = jsonLdGraph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: "Guest posting sites by niche, country and budget",
      description: lead,
      isPartOf: { "@id": `${canonicalOrigin}/#website` },
      publisher: { "@id": `${canonicalOrigin}/#organization` },
      dateModified:
        stats?.updatedAt &&
        Date.parse(stats.updatedAt) > Date.parse(guestPostingHubUpdatedAt)
          ? stats.updatedAt
          : guestPostingHubUpdatedAt,
      ...(list ? { mainEntity: list } : {}),
    },
    faqPageNode(faq),
  );
  const figures = [
    datedStats && ["Active publications", count(datedStats.total)],
    datedStats && facets && ["Topics", count(facets.categories.length)],
    datedStats && facets && ["Countries", count(facets.countries.length)],
    datedStats?.medianPriceCents != null && [
      "Median placement price",
      usd(datedStats!.medianPriceCents!),
    ],
  ].filter((item): item is [string, string] => Array.isArray(item));

  return (
    <InformationShell
      path="/guest-posting-sites/"
      title="Guest posting sites by niche, country and budget"
      label="Guest posting sites"
      description={lead}
      active="marketplace"
      image="/15_laptop_dashboard_illustration.png"
      className="hub-page"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />

      <section className="hub-summary" aria-label="Catalogue at a glance">
        <DataDisclosure asOf={datedStats?.updatedAt} />
        {figures.length > 0 && (
          <dl className="hub-stats">
            {figures.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="hub-actions">
          <Link className="button button-primary" href="/">
            Browse all publications <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" href="#how-to-choose">
            How to choose a site
          </Link>
        </div>

        {stats?.updatedAt && (
          <p className="hub-updated">
            Live catalogue, last updated{" "}
            <time dateTime={stats.updatedAt}>
              {new Date(stats.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
            . Metrics are supplied with each listing and are not independently
            verified. Confirm publisher authorization, current availability and
            scope before proceeding. Saving a plan does not reserve a placement;
            online ordering and payment are currently disabled.
          </p>
        )}
      </section>

      <nav className="hub-toc" aria-label="On this page">
        <a href="#niches">Niches</a>
        <a href="#top-publications">Top publications</a>
        <a href="#by-metrics">DA, DR, traffic &amp; price</a>
        <a href="#prices">Prices by niche</a>
        <a href="#how-to-choose">How to choose</a>
        <a href="#faq">FAQ</a>
      </nav>

      <section className="hub-section" aria-labelledby="niches">
        <div className="hub-heading">
          <p className="eyebrow">Directories</p>
          <h2 id="niches">Browse guest posting sites by niche</h2>
          <p>
            Each directory shows its strongest publications, live prices and
            advice for that audience.
          </p>
        </div>
        <div className="hub-niches">
          {directories.map((directory, index) => {
            const Icon = nicheIcons[directory.slug] || Flag;
            return (
              <article className="hub-niche" key={directory.slug}>
                <span className="hub-niche-icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3>
                  <Link href={`/${directory.slug}/`}>{directory.h1}</Link>
                </h3>
                <p>{directory.lead}</p>
                <Suspense fallback={null}>
                  <HubNicheFacts niches={niches} index={index} />
                </Suspense>
              </article>
            );
          })}
        </div>
      </section>

      {!top && (
        <section className="hub-section" role="status">
          <h2>Publication listings are temporarily unavailable</h2>
          <p>
            Please try again. You can still explore the topics and buying guides
            below.
          </p>
          <CatalogueRetry />
        </section>
      )}

      {top && top.data.length > 0 && (
        <section className="hub-section" aria-labelledby="top-publications">
          <div className="hub-heading">
            <p className="eyebrow">Highest rated</p>
            <h2 id="top-publications">
              Top guest posting sites by Domain Rating
            </h2>
            <p>
              The {top.data.length} active listings with the highest supplied
              Domain Rating. Linked names open a profile with full details and
              price comparisons.
            </p>
          </div>
          <PublicationTable products={top.data} />
        </section>
      )}

      <section className="hub-section" aria-labelledby="by-metrics">
        <div className="hub-heading">
          <p className="eyebrow">Marketplace views</p>
          <h2 id="by-metrics">Compare sites by DA, DR, traffic and price</h2>
          <p>
            Each view is a fixed range of the live catalogue. Listings without a
            value for that metric are left out rather than counted as zero.
          </p>
        </div>
        <div className="hub-ranges">
          {marketplaceGroups.map((group) => {
            const [title, note] = groupNames[group.title] || [group.title, ""];
            return (
              <div className="hub-range-group" key={group.title}>
                <h3>{title}</h3>
                {note && <p>{note}</p>}
                <ul>
                  {group.ranges.map((range) => (
                    <li key={range.slug}>
                      <Link href={`/${range.slug}/`}>
                        {range.label.replace(/^Traffic /, "")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <HubPrices datedStats={datedStats} prices={prices} />

      <section className="hub-section" aria-labelledby="how-to-choose">
        <div className="hub-heading">
          <p className="eyebrow">Buyer checklist</p>
          <h2 id="how-to-choose">How to choose a guest posting site</h2>
          <p>
            Five checks to run before you add a placement to your shortlist.
          </p>
        </div>
        <ol className="hub-steps">
          {steps.map(([title, body]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <p className="hub-note">
          More detail:{" "}
          <Link href="/guides/vet-a-guest-post-site/">
            how to vet a guest post site
          </Link>
          ,{" "}
          <Link href="/guides/da-vs-dr-and-traffic/">DA vs DR and traffic</Link>{" "}
          and the{" "}
          <Link href="/how-to-buy-links/">guest post buying checklist</Link>.
        </p>
      </section>

      <section className="hub-section" aria-labelledby="faq">
        <div className="hub-heading">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq">Common questions about guest posting sites</h2>
        </div>
        <div className="hub-faq">
          {faq.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hub-cta" aria-labelledby="hub-cta">
        <h2 id="hub-cta">Find a site your audience already reads</h2>
        <p>
          Filter the full catalogue by topic, country, language, metrics and
          price, and shortlist up to four publications to compare.
        </p>
        <div className="hub-actions">
          <Link className="button button-primary" href="/">
            Open the marketplace <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" href="/guides/">
            Read the buying guides
          </Link>
        </div>
      </section>
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/guest-posting-sites/", await searchParams);
  return pageMetadata(
    {
      title: "Guest Posting Sites by Niche, Country and Budget",
      description:
        "Compare guest posting sites by niche, country, DA, DR, traffic and USD placement price. Explore catalogue price data and a buyer checklist.",
      ...facets,
    },
    "/guest-posting-sites/",
  );
}

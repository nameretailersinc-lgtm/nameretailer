import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  FileCheck2,
  Globe2,
  HelpCircle,
  Layers3,
  Scale,
  Sparkles,
} from "lucide-react";
import { InformationShell } from "@/components/site/information-page";
import { BuyPlacement } from "@/components/cart/buy-placement";
import {
  ShortlistProvider,
  ShortlistButton,
} from "@/components/marketplace/shortlist";
import { PublicationShortlist } from "@/components/marketplace/publication-shortlist";
import { validAsOf } from "@/components/site/data-disclosure";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import {
  publicationPath,
  validPublicationSlug,
  validPublicationListingId,
} from "@/lib/commerce/publication-pages";
import {
  publicationProfile,
  publicationIndexable,
  relatedProfiles,
} from "@/lib/commerce/publication-profiles";
import {
  publicationPresentation,
  publicationUsd as usd,
  publicationNumber as number,
  publicationDate as date,
  publicationPriceComparison,
} from "@/lib/commerce/publication-presentation";
import { directories } from "@/lib/site/directories";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import styles from "./publication-detail.module.css";

type Props = {
  params: Promise<{ domain: string; listing?: string }>;
  searchParams: Promise<SearchParams>;
};

async function load(params: Props["params"]) {
  const raw = await params;
  const slug = raw.domain.toLowerCase().replaceAll(".", "-");
  const listing = raw.listing?.toLowerCase();
  if (
    !validPublicationSlug(slug) ||
    (listing !== undefined && !validPublicationListingId(listing))
  )
    notFound();
  await connection();
  const product = await publicationProfile(slug, listing);
  if (!product) notFound();
  const path = publicationPath(product)!;
  if (
    `/publication/${raw.domain}/${raw.listing ? `${raw.listing}/` : ""}` !==
    path
  )
    permanentRedirect(path);
  return { product, view: publicationPresentation(product), path };
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { product, view, path } = await load(params);
  // Detail pages have no paginated version. Every query variant canonicalizes here.
  const facets = facetMetadata(path, await searchParams);
  return pageMetadata(
    {
      title: view.title,
      description: view.description,
      alternates: { canonical: canonicalOrigin + path },
      robots: (await publicationIndexable(product))
        ? facets.robots
        : { index: false, follow: true },
    },
    path,
  );
}

function Fact({
  term,
  value,
  wide = false,
}: {
  term: string;
  value?: string | null;
  wide?: boolean;
}) {
  if (!value?.trim()) return null;
  return (
    <div className={wide ? styles.wide : undefined}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Text({ children }: { children: string }) {
  return <p className={styles.text}>{children}</p>;
}

export default async function Page({ params }: Props) {
  const { product, view, path } = await load(params);
  const [topic, related] = await Promise.all([
    product.category
      ? catalogueSummary(
          new URLSearchParams({ category: product.category }).toString(),
        ).catch(() => null)
      : null,
    relatedProfiles(product).catch(() => []),
  ]);
  const content = product.publicationContent;
  const m = product.metrics;
  const comparison =
    topic && validAsOf(topic.updatedAt)
      ? publicationPriceComparison(product.priceCents, topic.medianPriceCents)
      : null;
  const browse = (key: string, value: string) =>
    `/?${new URLSearchParams({ [key]: value })}`;
  const matchingDirectories = directories
    .filter(
      (directory) =>
        directory.filter.categories?.includes(product.category) ||
        directory.filter.country === product.country,
    )
    .slice(0, 3);
  const writing = product.writingOptions || [];
  const url = canonicalOrigin + path;

  const metricCards = [
    {
      term: "Placement price",
      value: usd(product.priceCents),
      hint: "USD · writing priced separately",
      tone: styles.metricPrice,
      Icon: CircleDollarSign,
    },
    {
      term: "Domain Rating",
      value: number(m.dr),
      hint: "Supplied Ahrefs score",
      tone: styles.metricDr,
      Icon: Award,
    },
    {
      term: "Domain Authority",
      value: number(m.da),
      hint: "Supplied Moz score",
      tone: styles.metricDa,
      Icon: ChartNoAxesColumnIncreasing,
    },
    {
      term: "Traffic estimate",
      value: number(m.traffic),
      hint: content?.metricsSource
        ? "Source details recorded below"
        : "Supplied traffic estimate",
      tone: styles.metricTraffic,
      Icon: Globe2,
    },
  ].filter((card) => card.value !== "");
  const hasEditorial = [
    content?.editorialGuidelines,
    content?.contentRequirements,
    content?.restrictedTopics,
    content?.wordCountRequirements,
    content?.imageRequirements,
    content?.editorialProcess,
    content?.linkPolicy,
  ].some(Boolean);

  return (
    <InformationShell
      path={path}
      parent={["Guest posting sites", "/guest-posting-sites/"]}
      title={`Guest post placement on ${view.label}`}
      label={view.identity}
      description={view.summary}
      active="marketplace"
      image="/03_listing_browser_panel.png"
      className={styles.profile}
    >
      <ShortlistProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": `${url}#page`,
              url,
              name: `Guest post placement on ${view.label}`,
              description: view.summary,
              isPartOf: { "@id": `${canonicalOrigin}/#website` },
              ...(view.questions.length
                ? {
                    mainEntity: {
                      "@type": "FAQPage",
                      mainEntity: view.questions.map(([question, answer]) => ({
                        "@type": "Question",
                        name: question,
                        acceptedAnswer: { "@type": "Answer", text: answer },
                      })),
                    },
                  }
                : {}),
              about: {
                "@type": view.section ? "WebPage" : "WebSite",
                name: view.label,
                url: product.domain,
              },
              ...(validAsOf(product.updatedAt)
                ? { dateModified: product.updatedAt }
                : {}),
            }),
          }}
        />

        {/* Quick Section Navigation Bar */}
        <nav aria-label="Publication page sections" className={styles.nav}>
          <a href="#publication-overview">Listing overview</a>
          <a href="#publication-pricing">Price and scope</a>
          {content && (
            <a href="#publisher-information">Publisher information</a>
          )}
          {comparison && <a href="#publication-comparison">Price comparison</a>}
          <a href="#publication-questions">Questions</a>
        </nav>

        {/* Top 4 Metric Cards */}
        <dl
          className={styles.metrics}
          aria-label={`${view.identity} key listing figures`}
        >
          {metricCards.map(({ term, value, hint, tone, Icon }) => (
            <div key={term} className={`${styles.metric} ${tone}`}>
              <div className={styles.metricHeader}>
                <dt>{term}</dt>
                <span className={styles.metricIcon} aria-hidden="true">
                  <Icon size={18} />
                </span>
              </div>
              <dd>{value}</dd>
              <small>{hint}</small>
            </div>
          ))}
        </dl>

        {/* Main 2-Column Content & Sticky Sidebar */}
        <div className={styles.layout}>
          <aside
            className={`reference-card ${styles.sidebar}`}
            aria-labelledby="plan-sidebar-title"
          >
            <p className="reference-pill">Placement summary</p>
            <h2 id="plan-sidebar-title">{view.label}</h2>
            <div className={styles.sidebarPriceBox}>
              <strong>{usd(product.priceCents)}</strong>
              <p>USD placement · writing separate</p>
            </div>
            <dl className={styles.sidebarFacts}>
              <Fact term="Listed topic" value={product.category} />
              <Fact term="Language" value={product.language} />
              <Fact term="Stated turnaround" value={product.turnaround} />
            </dl>
            <div className="publication-actions">
              <BuyPlacement productId={product.id} />
              <ShortlistButton product={product} showLabel />
              <a href="#publication-pricing">Review price and scope</a>
            </div>
            <p className={styles.stamp}>
              Select Add to plan to review current options and prepare your
              placement brief.
            </p>
          </aside>

          <div className={styles.body}>
            {/* Section 1: Listing Overview */}
            <section
              className="reference-card"
              id="publication-overview"
              aria-labelledby="overview-title"
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Layers3 size={20} />
                </span>
                <h2 id="overview-title">{view.identity}: listing overview</h2>
              </div>
              {view.section && (
                <p className={styles.notice}>
                  This is a section-specific listing. Confirm the placement
                  location and whether supplied metrics describe this section or
                  the whole domain.
                </p>
              )}
              <dl className={styles.facts}>
                <Fact term="Exact listed URL" value={product.domain} wide />
                <Fact term="Catalogue topic" value={product.category} />
                <Fact term="Supplied listing country" value={product.country} />
                <Fact term="Supplied language" value={product.language} />
                <Fact term="Stated turnaround" value={product.turnaround} />
                <Fact term="Supplied link terms" value={product.linkType} />
                <Fact term="Spam score" value={number(m.spamScore)} />
                <Fact
                  term="Metric measurement date"
                  value={date(
                    content?.metricsMeasuredAt || product.metricsUpdatedAt,
                  )}
                />
                <Fact
                  term="Listing record updated"
                  value={date(product.updatedAt)}
                />
              </dl>
              <div className={styles.pillLinks}>
                <Link href="/methodology/">
                  Listing sources and metric methodology
                </Link>
                <Link href="/guides/da-vs-dr-and-traffic/">
                  Understand DA, DR and traffic
                </Link>
              </div>
              <p className={styles.stamp}>
                Listing reference: <span>{product.id}</span>
              </p>
            </section>

            {/* Section 2: Placement Cost & Scope */}
            <section
              className="reference-card"
              id="publication-pricing"
              aria-labelledby="pricing-title"
            >
              <div className={styles.sectionHeader}>
                <span
                  className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}
                  aria-hidden="true"
                >
                  <CircleDollarSign size={20} />
                </span>
                <h2 id="pricing-title">Placement cost for {view.identity}</h2>
              </div>
              <p>
                The listed placement price is{" "}
                <strong>{usd(product.priceCents)}</strong>. Writing is a
                separate option where offered.
              </p>
              {writing.length ? (
                <div
                  className="directory-table-wrap"
                  role="region"
                  tabIndex={0}
                  aria-label="Available writing charges"
                >
                  <table className={styles.table}>
                    <caption>
                      Available writing charges for this listing
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Writing option</th>
                        <th scope="col">Additional USD</th>
                        <th scope="col">Placement + writing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {writing.map((option) => (
                        <tr key={option.words}>
                          <th scope="row">{option.words} words</th>
                          <td>{usd(option.priceCents)}</td>
                          <td>
                            <strong>
                              {usd(product.priceCents + option.priceCents)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className={styles.scopeGrid}>
                {content?.priceIncludes && (
                  <div className={styles.scopeBox}>
                    <h3>What is included?</h3>
                    <Text>{content.priceIncludes}</Text>
                  </div>
                )}
                {content?.priceExcludes && (
                  <div className={styles.scopeBox}>
                    <h3>Exclusions and additional charges</h3>
                    <Text>{content.priceExcludes}</Text>
                  </div>
                )}
              </div>

              <div className="publication-actions">
                <a
                  href={product.domain}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className={styles.visitLink}
                >
                  Visit {view.host}{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                  <span className="screen-reader-only">
                    {" "}
                    (opens in a new tab)
                  </span>
                </a>
              </div>
              <p className={styles.stamp}>
                Send your brief to receive a quote for this publication.
              </p>
            </section>

            {/* Section 3: Publisher Information (if available) */}
            {content && (
              <section
                className="reference-card"
                id="publisher-information"
                aria-labelledby="publisher-title"
              >
                <div className={styles.sectionHeader}>
                  <span
                    className={`${styles.sectionIcon} ${styles.sectionIconPurple}`}
                    aria-hidden="true"
                  >
                    <BookOpen size={20} />
                  </span>
                  <h2 id="publisher-title">
                    About {view.name}
                    {view.section ? ` — ${view.section}` : ""}
                  </h2>
                </div>
                <Text>{content.description}</Text>
                <div className={styles.subSectionList}>
                  {content.audienceDetails && (
                    <div className={styles.subSectionItem}>
                      <h3>Documented audience information</h3>
                      <Text>{content.audienceDetails}</Text>
                    </div>
                  )}
                  {(
                    [
                      ["Secondary niches", content.secondaryNiches],
                      ["Content categories", content.contentCategories],
                      [
                        "Documented differentiators",
                        content.uniqueDifferentiators,
                      ],
                      ["Editorial notes", content.editorialNotes],
                      ["Metric source and scope", content.metricsSource],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([heading, value]) => (
                      <div key={heading} className={styles.subSectionItem}>
                        <h3>{heading}</h3>
                        <Text>{value}</Text>
                      </div>
                    ))}
                </div>
                <p className={styles.stamp}>
                  Profile evidence checked {date(content.checkedAt)}.{" "}
                  <a
                    href={content.sourceUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    Read the supporting source
                    <span className="screen-reader-only">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                  . Editorial review of this text does not verify every supplied
                  metric or guarantee a placement.
                </p>
              </section>
            )}

            {/* Section 4: Relevance & Suitability */}
            <section
              className="reference-card"
              aria-labelledby="suitability-title"
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Sparkles size={20} />
                </span>
                <h2 id="suitability-title">
                  Is {view.identity} relevant to your brief?
                </h2>
              </div>
              <p>
                {product.category
                  ? `Use its supplied ${product.category} classification as an initial topic filter.`
                  : ""}{" "}
                {product.language
                  ? `The listed language is ${product.language}; check that it fits your proposed article.`
                  : ""}{" "}
                Compare the {usd(product.priceCents)} placement cost with your
                confirmed budget.
              </p>
              {content?.acceptedTopics && (
                <div className={styles.subSectionItem}>
                  <h3>Confirmed accepted topics</h3>
                  <Text>{content.acceptedTopics}</Text>
                </div>
              )}
            </section>

            {/* Section 5: Editorial Requirements */}
            {hasEditorial && (
              <section
                className="reference-card"
                aria-labelledby="editorial-title"
              >
                <div className={styles.sectionHeader}>
                  <span
                    className={`${styles.sectionIcon} ${styles.sectionIconBlue}`}
                    aria-hidden="true"
                  >
                    <FileCheck2 size={20} />
                  </span>
                  <h2 id="editorial-title">
                    Editorial requirements for {view.identity}
                  </h2>
                </div>
                {content?.editorialGuidelines && (
                  <Text>{content.editorialGuidelines}</Text>
                )}
                <div className={styles.subSectionList}>
                  {(
                    [
                      ["Submission requirements", content?.contentRequirements],
                      ["Restricted topics", content?.restrictedTopics],
                      ["Article length", content?.wordCountRequirements],
                      ["Image requirements", content?.imageRequirements],
                      [
                        "Review and publication process",
                        content?.editorialProcess,
                      ],
                      ["Confirmed link policy", content?.linkPolicy],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([heading, value]) => (
                      <div key={heading} className={styles.subSectionItem}>
                        <h3>{heading}</h3>
                        <Text>{value!}</Text>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {product.requirements && (
              <section className="reference-card">
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    <CheckCircle2 size={20} />
                  </span>
                  <h2>Supplied placement requirements for {view.identity}</h2>
                </div>
                <Text>{product.requirements}</Text>
              </section>
            )}

            {/* Section 6: Category Price Comparison */}
            {comparison && topic && (
              <section
                className="reference-card"
                id="publication-comparison"
                aria-labelledby="comparison-title"
              >
                <div className={styles.sectionHeader}>
                  <span
                    className={`${styles.sectionIcon} ${styles.sectionIconPurple}`}
                    aria-hidden="true"
                  >
                    <Scale size={20} />
                  </span>
                  <h2 id="comparison-title">
                    How {view.identity} is priced within {product.category}
                  </h2>
                </div>
                <p>
                  At {usd(product.priceCents)}, this placement is{" "}
                  <strong>{comparison}</strong> of{" "}
                  {usd(topic.medianPriceCents!)} across {number(topic.total)}{" "}
                  active {product.category} listings. Listed prices in this
                  topic span {usd(topic.minPriceCents!)} to{" "}
                  {usd(topic.maxPriceCents!)}.
                </p>
                <div className={styles.comparisonStats}>
                  <div className={styles.comparisonStat}>
                    <span>Category Median</span>
                    <strong>{usd(topic.medianPriceCents!)}</strong>
                  </div>
                  <div className={styles.comparisonStat}>
                    <span>Category Price Range</span>
                    <strong>
                      {usd(topic.minPriceCents!)} – {usd(topic.maxPriceCents!)}
                    </strong>
                  </div>
                  <div className={styles.comparisonStat}>
                    <span>Active Listings</span>
                    <strong>{number(topic.total)}</strong>
                  </div>
                </div>
                <p>
                  The median covers all matching active, committed-import
                  listings, not just the alternatives below. Writing and scope
                  can differ. This comparison does not estimate article
                  visitors, return or editorial quality.
                </p>
                <div className={styles.pillLinks}>
                  <Link href={browse("category", product.category)}>
                    Compare the {product.category} catalogue
                  </Link>
                  <Link href="/guides/guest-post-cost/">
                    Plan the complete guest-post budget
                  </Link>
                </div>
              </section>
            )}

            {/* Section 7: Nearby Alternatives */}
            {related.length > 0 && (
              <section
                className="reference-card"
                aria-labelledby="alternatives-title"
              >
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    <Compass size={20} />
                  </span>
                  <h2 id="alternatives-title">
                    Nearby placement prices in {product.category}
                  </h2>
                </div>
                <p>
                  Up to six other listings in the same supplied topic. Matching
                  language is preferred first, then supplied listing country,
                  then the smallest price difference. Similar prices do not
                  imply equivalent scope or quality.
                </p>
                <ul className={styles.alternatives}>
                  {related.map((item) => {
                    const itemHost = new URL(item.domain).hostname;
                    const itemPath =
                      new URL(item.domain).pathname !== "/"
                        ? new URL(item.domain).pathname
                        : "";
                    const monogram = itemHost
                      .replace(/^www\./, "")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <li key={item.id}>
                        <div>
                          <div className={styles.altHeader}>
                            <span
                              className={styles.altMonogram}
                              aria-hidden="true"
                            >
                              {monogram}
                            </span>
                            <h3>
                              <Link href={publicationPath(item)!}>
                                {itemHost}
                                {itemPath}
                              </Link>
                            </h3>
                          </div>
                          <p className={styles.altPriceRow}>
                            <strong>{usd(item.priceCents)}</strong> ·{" "}
                            {item.priceCents === product.priceCents
                              ? "Same price"
                              : `${usd(Math.abs(item.priceCents - product.priceCents))} ${item.priceCents > product.priceCents ? "more" : "less"}`}
                          </p>
                          <p className={styles.altMeta}>
                            {[item.language, item.country]
                              .filter(Boolean)
                              .join(" · ")}
                            <br />
                            {item.metrics.dr != null && (
                              <>
                                Supplied DR:{" "}
                                <strong>{number(item.metrics.dr)}</strong>
                              </>
                            )}
                          </p>
                        </div>
                        <ShortlistButton product={item} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Section 8: Publication Shortlist Comparison */}
            <PublicationShortlist />

            {/* Section 10: Questions / FAQ */}
            <section
              className="reference-card"
              id="publication-questions"
              aria-labelledby="questions-title"
            >
              <div className={styles.sectionHeader}>
                <span
                  className={`${styles.sectionIcon} ${styles.sectionIconPurple}`}
                  aria-hidden="true"
                >
                  <HelpCircle size={20} />
                </span>
                <h2 id="questions-title">Questions about {view.identity}</h2>
              </div>
              <div className={styles.questions}>
                {view.questions.map(([question, answer]) => (
                  <details key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Section 11: Continue Comparing Relevant Listings */}
            <section className="reference-card" aria-labelledby="browse-title">
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Compass size={20} />
                </span>
                <h2 id="browse-title">Continue comparing relevant listings</h2>
              </div>
              <ul className={styles.browseList}>
                {product.category && (
                  <li>
                    <Link href={browse("category", product.category)}>
                      <span>All {product.category} listings</span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {product.country && (
                  <li>
                    <Link href={browse("country", product.country)}>
                      <span>Listings supplied under {product.country}</span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {product.language && (
                  <li>
                    <Link href={browse("language", product.language)}>
                      <span>{product.language} listings</span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {matchingDirectories.map((directory) => (
                  <li key={directory.slug}>
                    <Link href={`/${directory.slug}/`}>
                      <span>{directory.label}</span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </ShortlistProvider>
    </InformationShell>
  );
}

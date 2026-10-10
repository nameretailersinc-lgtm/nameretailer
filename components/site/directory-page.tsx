import { BuyerGuideLinks } from "./buyer-guide-links";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  Code2,
  Compass,
  FileText,
  Flag,
  Grid2X2,
  HeartPulse,
  Layers3,
  Lightbulb,
  Link2,
  Megaphone,
  Monitor,
  Plane,
  Search,
  ShoppingCart,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import guideStyles from "./homepage-guides.module.css";
import { InformationShell } from "./information-page";
import { publicDirectoryListings } from "@/lib/commerce/public-directory";
import { directories, type Directory } from "@/lib/site/directories";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { DirectorySummary } from "./directory-summary";
import { itemListNode } from "@/lib/seo/json-ld";
import { publicationPath } from "@/lib/commerce/publication-pages";
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
    return await publicDirectoryListings(directory);
  } catch {
    return null;
  }
}

/** Plain HTML links between the directory hub, niche pages, tools and guides. */
function ExploreLink({
  href,
  label,
  Icon,
  homepage,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  homepage: boolean;
}) {
  return (
    <li>
      <Link href={href}>
        {homepage && <Icon size={16} aria-hidden="true" />}
        <span>{label}</span>
        {homepage && <ChevronRight size={14} aria-hidden="true" />}
      </Link>
    </li>
  );
}

export function DirectoryLinks({
  exclude,
  homepage = false,
}: {
  exclude?: string;
  homepage?: boolean;
}) {
  return (
    <section
      className={`reference-information-next${homepage ? ` ${guideStyles.directoryExplore}` : ""}`}
      aria-label="Explore more"
    >
      <p className="eyebrow">
        {homepage && <Compass size={17} aria-hidden="true" />}Keep exploring
      </p>
      <div className="reference-three-grid">
        <article
          className={`reference-card${homepage ? ` ${guideStyles.directoryCard} ${guideStyles.greenCard}` : ""}`}
        >
          <div
            className={homepage ? guideStyles.directoryCardHeading : undefined}
          >
            {homepage && (
              <span className={guideStyles.directoryIcon}>
                <Layers3 size={28} aria-hidden="true" />
              </span>
            )}
            <div>
              <h2>Publishers by niche</h2>
              {homepage && (
                <p>
                  Explore guest posting sites across popular industries and
                  topics.
                </p>
              )}
            </div>
            {homepage && (
              <Link
                href="/guest-posting-sites/"
                aria-label="Explore all publisher directories"
              >
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="directory-link-list">
            <ExploreLink
              href="/guest-posting-sites/"
              label="All guest posting sites"
              Icon={Grid2X2}
              homepage={homepage}
            />
            {directories
              .filter((directory) => directory.slug !== exclude)
              .map((directory, index) => (
                <ExploreLink
                  key={directory.slug}
                  href={`/${directory.slug}/`}
                  label={directory.h1}
                  Icon={
                    [
                      Monitor,
                      Cloud,
                      Tag,
                      Flag,
                      Megaphone,
                      BriefcaseBusiness,
                      HeartPulse,
                      Plane,
                    ][index % 8]
                  }
                  homepage={homepage}
                />
              ))}
          </ul>
        </article>
        <article
          className={`reference-card${homepage ? ` ${guideStyles.directoryCard} ${guideStyles.blueCard}` : ""}`}
        >
          <div
            className={homepage ? guideStyles.directoryCardHeading : undefined}
          >
            {homepage && (
              <span className={guideStyles.directoryIcon}>
                <Wrench size={28} aria-hidden="true" />
              </span>
            )}
            <div>
              <h2>Free SEO tools</h2>
              {homepage && (
                <p>
                  Analyze domains, keywords, and competitors before you reach
                  out.
                </p>
              )}
            </div>
            {homepage && (
              <Link href="/seo-tools/" aria-label="Explore all SEO tools">
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="directory-link-list">
            <ExploreLink
              href="/bulk-domain-rating-checker/"
              label="Catalogue Domain Rating lookup"
              Icon={ChartNoAxesColumnIncreasing}
              homepage={homepage}
            />
            <ExploreLink
              href="/keyword-density-checker/"
              label="Keyword density checker"
              Icon={Search}
              homepage={homepage}
            />
            <ExploreLink
              href="/competitor-backlink-analyzer/"
              label="Competitor backlink analyzer"
              Icon={Link2}
              homepage={homepage}
            />
            <ExploreLink
              href="/schema-markup-validator/"
              label="JSON-LD structure checker"
              Icon={Code2}
              homepage={homepage}
            />
            <ExploreLink
              href="/seo-tools/"
              label="All free tools"
              Icon={Grid2X2}
              homepage={homepage}
            />
          </ul>
          {homepage && (
            <div className={guideStyles.directoryCallout}>
              <ChartNoAxesColumnIncreasing size={35} aria-hidden="true" />
              <div>
                <p>Research, check structure, and plan with our free tools.</p>
                <Link href="/seo-tools/">
                  Explore SEO tools <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </article>
        <article
          className={`reference-card${homepage ? ` ${guideStyles.directoryCard} ${guideStyles.amberCard}` : ""}`}
        >
          <div
            className={homepage ? guideStyles.directoryCardHeading : undefined}
          >
            {homepage && (
              <span className={guideStyles.directoryIcon}>
                <BookOpen size={28} aria-hidden="true" />
              </span>
            )}
            <div>
              <h2>Learn before you buy</h2>
              {homepage && (
                <p>
                  Useful guides, checklists, and resources to help you plan your
                  placement.
                </p>
              )}
            </div>
            {homepage && (
              <Link
                href="/guides/"
                aria-label="Explore all guest posting guides"
              >
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="directory-link-list">
            <ExploreLink
              href="/how-to-buy-links/"
              label="How to evaluate guest post sites"
              Icon={Search}
              homepage={homepage}
            />
            <ExploreLink
              href="/blog/a-practical-guest-post-budget-worksheet/"
              label="A practical guest-post budget worksheet"
              Icon={ChartNoAxesColumnIncreasing}
              homepage={homepage}
            />
            <ExploreLink
              href="/blog/an-editorial-review-checklist-for-a-publication-shortlist/"
              label="Editorial review checklist for a shortlist"
              Icon={FileText}
              homepage={homepage}
            />
            <ExploreLink
              href="/how-it-works/"
              label="How Name Retailer works"
              Icon={Wrench}
              homepage={homepage}
            />
            <ExploreLink
              href="/guides/"
              label="All guides"
              Icon={BookOpen}
              homepage={homepage}
            />
          </ul>
          {homepage && (
            <div className={guideStyles.directoryCallout}>
              <Lightbulb size={36} aria-hidden="true" />
              <div>
                <strong>New to guest posting?</strong>
                <p>Read our guides to prepare your next placement.</p>
                <Link href="/guides/">
                  View all guides <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export async function DirectoryPage({ directory }: { directory: Directory }) {
  const [result, stats] = await Promise.all([
    listings(directory),
    catalogueSummary("", directory.slug).catch(() => null),
  ]);
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
      ...(result && itemListNode(result.data)
        ? { mainEntity: itemListNode(result.data) }
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
              <strong>
                {stats?.updatedAt &&
                Number.isFinite(Date.parse(stats.updatedAt))
                  ? number(result.total)
                  : "Matching"}
              </strong>{" "}
              active publications
              {stats?.updatedAt &&
              Number.isFinite(Date.parse(stats.updatedAt)) &&
              result.lowestPriceCents !== null
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
                        <th scope="row">
                          {publicationPath(product) ? (
                            <Link
                              href={publicationPath(product)!}
                              prefetch={false}
                            >
                              {host(product.domain)}
                            </Link>
                          ) : (
                            <span>{host(product.domain)}</span>
                          )}
                        </th>
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
        {stats && <DirectorySummary label={directory.h1} stats={stats} />}
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
      <BuyerGuideLinks />
    </InformationShell>
  );
}

/** Crawlable introduction and links shown under the marketplace landing page. */
export function LandingExplore() {
  return (
    <section
      className={`landing-explore ${guideStyles.guideSection}`}
      aria-labelledby="landing-explore"
    >
      <div className={guideStyles.guidePanel}>
        <div className={guideStyles.guideHero}>
          <div className={guideStyles.guideCopy}>
            <span className={guideStyles.guideBadge}>
              <BookOpen size={15} aria-hidden="true" />
              Guide &amp; tips
            </span>
            <h2 id="landing-explore">
              Compare guest posting sites before you <span>commit</span>
            </h2>
            <p>
              Name Retailer is a guest post marketplace for brands, agencies and
              SEO teams. Every listing shows the publication’s topic, audience
              country and language, supplied Domain Authority, Domain Rating and
              traffic estimates, and a USD placement price, so you can judge
              audience fit and value side by side instead of across scattered
              spreadsheets.
            </p>
          </div>
          <div className={guideStyles.guideArt} aria-hidden="true">
            <Image
              src="/03_listing_browser_panel.png"
              width={880}
              height={405}
              alt=""
              sizes="(max-width: 800px) 90vw, 45vw"
            />
            <div className={guideStyles.guideMetricLabels}>
              <span>DA</span>
              <span>DR</span>
              <span>Traffic</span>
            </div>
            <span className={guideStyles.guideMagnifier}>
              <ChartNoAxesColumnIncreasing size={41} />
              <Search size={90} />
            </span>
            <div className={guideStyles.guideFlags}>
              {["us", "gb", "ca"].map((code) => (
                <Image
                  key={code}
                  src={`/flags/${code}.svg`}
                  width={24}
                  height={18}
                  alt=""
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>
        <div className={guideStyles.guideSteps}>
          {[
            {
              Icon: FileText,
              title: "How to choose a publication",
              text: "Check recent articles, relevance, country and language, then compare DA, DR and traffic with similar sites.",
            },
            {
              Icon: CircleDollarSign,
              title: "What the price includes",
              text: "Each listing shows a USD placement price, shown separately from any article writing.",
            },
            {
              Icon: ShoppingCart,
              title: "Browse first, plan when ready",
              text: "Compare up to four publications and save a private plan. Ordering and payment are not available yet.",
            },
          ].map(({ Icon, title, text }, index) => (
            <article key={title}>
              <span className={guideStyles.stepNumber}>{index + 1}</span>
              <span className={guideStyles.stepIcon}>
                <Icon size={30} aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <details className={guideStyles.guideDetails}>
          <summary>Read the full publication checklist</summary>
          <div>
            <p>
              Start with a niche directory below, open a{" "}
              <Link href="/guest-posting-sites/">
                guest posting sites directory
              </Link>{" "}
              by metric or budget, or use the filters above to build your own
              shortlist.
            </p>
            <h3>How to choose a publication</h3>
            <p>
              Begin with relevance. Read a publication’s recent articles and ask
              whether your topic would sit naturally beside them, then use
              country and language to confirm the audience. Domain Authority is
              Moz’s score and Domain Rating is Ahrefs’; they are different
              measures, so compare each only within its own system and treat
              them as one signal among several. You can{" "}
              <Link href="/guides/da-vs-dr-and-traffic/">
                read how DA, DR and traffic estimates differ
              </Link>{" "}
              before you set filters. Shortlist several candidates rather than
              one, because requirements and availability differ between
              publishers, and compare their scope, topics and terms side by side
              before deciding.
            </p>
            <h3>What the price includes</h3>
            <p>
              Each listing shows a USD placement price. Writing is priced
              separately where it is offered, so a placement price is not a full
              campaign quote. A missing value is shown as unavailable, never as
              zero. Sponsored content should be disclosed, and Google recommends
              marking paid links with rel=&quot;sponsored&quot;; see the{" "}
              <Link href="/how-to-buy-links/">buying checklist</Link> for the
              questions to settle first.
            </p>
            <h3>Browse first, plan when ready</h3>
            <p>
              You can browse and compare without an account, and shortlist up to
              four publications. Signing in lets you save a private placement
              plan. Ordering and payment are not available yet, and a saved plan
              does not reserve a price or a placement, so confirm scope,
              disclosure and delivery timing with the team before you commit.
            </p>
          </div>
        </details>
      </div>
      <DirectoryLinks homepage />
    </section>
  );
}

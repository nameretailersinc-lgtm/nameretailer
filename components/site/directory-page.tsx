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
import { CountryName } from "./country-name";
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
        {directory.editorialUpdatedAt && (
          <p>Directory guidance updated <time dateTime={directory.editorialUpdatedAt}>{directory.editorialUpdatedAt}</time>. Listing observation dates are shown separately below.</p>
        )}
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
              <div className="directory-table-wrap" role="region" aria-label={`${directory.h1} listings`} tabIndex={0}>
                <table className="directory-table" aria-label={`${directory.h1} comparison`}>
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
                        <td>
                          <CountryName country={product.country} />
                        </td>
                        <td>
                          <span
                            className={
                              product.metrics?.dr == null
                                ? undefined
                                : "publication-metric-dr"
                            }
                          >
                            {number(product.metrics?.dr)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              product.metrics?.da == null
                                ? undefined
                                : "publication-metric-da"
                            }
                          >
                            {number(product.metrics?.da)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              product.metrics?.traffic == null
                                ? undefined
                                : "publication-metric-traffic"
                            }
                          >
                            {number(product.metrics?.traffic)}
                          </span>
                        </td>
                        <td className="publication-price">
                          {usd(product.priceCents)}
                        </td>
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
      {directory.resources?.length ? (
        <section className="reference-card" aria-labelledby="directory-resources">
          <h2 id="directory-resources">Further guidance and sources</h2>
          <ul>
            {directory.resources.map(([label, href]) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
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
              Name Retailer helps SEO agencies and small businesses compare
              guest posting sites with prices and niche filters. Review each
              publication’s topic, listing country, language and available
              supplied metrics, then shortlist up to four sites. Confirm
              audience fit and editorial terms with the publisher; a listing or
              authority score is not independent verification of quality.
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={code}
                  src={`/flags/${code}.svg`}
                  width={24}
                  height={18}
                  loading="lazy"
                  decoding="async"
                  alt=""
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
              text: "Compare up to four publications and select Request quote for shortlist to send one inquiry for your choices.",
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
              by metric or budget, or use the filters above to evaluate guest
              posting sites across industries, countries and editorial topics.
            </p>
            <h3>How to choose a publication</h3>
            <p>
              Begin with editorial relevance and audience fit. Read a
              publication’s recent articles and ask whether your guest post
              topic would sit naturally beside existing editorial coverage, then
              use country and language filters to narrow the guest post
              marketplace catalogue. A country field reflects the catalogue
              listing rather than independently verified reader geography.
              Domain Authority (DA) is Moz’s link-based score and Domain Rating
              (DR) is Ahrefs’ backlink authority metric; they measure different
              link graphs on logarithmic scales, so compare each metric only
              within its own system and treat authority scores as initial
              screening signals rather than proof of editorial quality. You can{" "}
              <Link href="/guides/da-vs-dr-and-traffic/">
                read how DA, DR and traffic estimates differ
              </Link>{" "}
              before setting marketplace filters. Review multiple guest posting
              sites side by side because editorial guidelines, turnaround windows
              and link policies vary across publishers.
            </p>
            <h3>What the guest post price includes</h3>
            <p>
              Each publication listing in the guest post marketplace displays a
              USD publisher fee. Article research, writing and editorial
              revisions are priced separately where offered, so a listed guest
              post price is one component of your total content and outreach
              budget. When a metric or publisher detail is missing from the
              catalogue, it appears explicitly as unavailable rather than zero.
              Paid guest posts and sponsored articles require transparent
              disclosure, and Google Search Essentials recommends qualifying
              paid or compensated links with <code>rel=&quot;sponsored&quot;</code>{" "}
              or <code>rel=&quot;nofollow&quot;</code>; consult the{" "}
              <Link href="/how-to-buy-links/">buying checklist</Link> and{" "}
              <Link href="/guides/paid-guest-posts-google-link-policies/">
                link attribute guide
              </Link>{" "}
              for qualification standards to settle with publishers before
              publication.
            </p>
            <h3>Browse guest posting sites first, commit when ready</h3>
            <p>
              SEO agencies, in-house marketing teams and founders can search the
              guest post marketplace, filter guest posting websites by topic or
              domain authority, and compare up to four publications without
              creating an account. Signing in allows you to save candidate
              publications to your account workspace while reviewing editorial
              fit with stakeholders. Select Add to plan to prepare a placement brief, or Request quote for shortlist to discuss your candidates. Confirm current pricing, editorial scope, attribution and timing with the team.
            </p>
            <h3>Evaluating guest posting sites for an agency or business</h3>
            <p>
              For a B2B software or technology campaign, begin with the{" "}
              <Link href="/saas-guest-posting-sites/">
                SaaS publisher directory
              </Link>{" "}
              or{" "}
              <Link href="/tech-guest-posting-sites/">
                technology guest posting sites
              </Link>
              , inspect recent editorial articles on each domain, and prepare an
              original article pitch tailored to the publication’s readers. For
              smaller content marketing budgets, filter{" "}
              <Link href="/guest-posting-sites-under-50/">
                guest posting sites under $50
              </Link>{" "}
              or{" "}
              <Link href="/guest-posting-sites-under-100/">
                guest posting sites under $100
              </Link>{" "}
              as an initial price ceiling, while budgeting separately for
              subject-matter writing and fact-checking. Lower guest post prices
              still require strict quality control: apply the{" "}
              <Link href="/guides/vet-a-guest-post-site/">
                publisher evaluation checklist
              </Link>{" "}
              to inspect outbound link neighborhoods, indexation health and
              topical consistency across recent posts.
            </p>
            <h3>Compare guest post prices and verify organic search traffic</h3>
            <p>
              A searchable guest post marketplace helps teams discover relevant
              publications by industry, from{" "}
              <Link href="/finance-guest-posting-sites/">
                finance guest posting sites
              </Link>{" "}
              and{" "}
              <Link href="/health-guest-posting-sites/">
                health publications
              </Link>{" "}
              to{" "}
              <Link href="/business-guest-posting-sites/">
                business media domains
              </Link>
              , but a third-party traffic number alone does not prove active
              organic readership. Check whether organic search traffic is spread
              across relevant industry queries rather than concentrated on a
              single unrelated page, and verify that recent articles appear in
              Google search results. Compare{" "}
              <Link href="/guest-post-prices/">
                guest post pricing by niche
              </Link>{" "}
              and read{" "}
              <Link href="/guides/guest-post-cost/">
                what a guest post costs
              </Link>{" "}
              alongside{" "}
              <Link href="/guides/guest-posting-for-seo/">
                how guest posting supports SEO
              </Link>{" "}
              to benchmark publisher fees, editorial standards and realistic
              organic search outcomes.
            </p>
            <h3>Editorial standards, internal linking and long-term visibility</h3>
            <p>
              Sustainable guest blogging depends on publishing genuinely useful
              articles on websites where your target audience already reads.
              Whether you are comparing paid guest posting sites with clearly
              disclosed sponsorship or pitching earned editorial contributions
              using our{" "}
              <Link href="/guides/outreach-email-templates/">
                guest post outreach email templates
              </Link>
              , prioritize topical authority, natural anchor text and strong
              on-site destination pages. Pair external publication coverage with
              a clear{" "}
              <Link href="/guides/internal-linking-for-seo/">
                internal linking strategy for SEO
              </Link>{" "}
              and a structured{" "}
              <Link href="/guides/technical-seo-checklist/">
                technical SEO checklist
              </Link>{" "}
              so referral visitors and search crawlers reach well-structured,
              indexable pages on your domain.
            </p>
          </div>
        </details>
      </div>
      <DirectoryLinks homepage />
    </section>
  );
}

import { faqPageNode } from "@/lib/seo/structured-data";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  HelpCircle,
  Layers,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { InformationShell } from "@/components/site/information-page";
import { EditorialByline } from "@/components/site/editorial-byline";
import { DirectorySummary } from "@/components/site/directory-summary";
import { MetricDefinitions } from "@/components/site/metric-definitions";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
import { domainGuides } from "@/lib/site/domain-guides";
import { priceBreakdown, type PriceRow } from "@/lib/commerce/price-breakdown";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { buyerGuideArticleNode, serializeJsonLd } from "@/lib/seo/json-ld";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
export const revalidate = 3600;
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
export async function generateMetadata({ params, searchParams }: Props) {
  const slug = (await params).slug;
  const item = buyerGuides.find((item) => item.slug === slug);
  if (!item) notFound();
  const facets = facetMetadata(`/guides/${slug}/`, await searchParams);
  return pageMetadata(
    {
      title: item.seoTitle || item.title,
      description: item.description,
      ...facets,
      openGraph: { type: "article", modifiedTime: item.updatedAt },
      ...(!item.approved ? { robots: { index: false, follow: true } } : {}),
    },
    `/guides/${slug}/`,
  );
}
const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "External reference";
  }
}

function relatedCategory(path: string) {
  if (path.startsWith("/guides/")) return "Buyer Guide";
  if (path.startsWith("/blog/")) return "Journal Article";
  if (path.startsWith("/tools/") || path.includes("checker")) return "SEO Tool";
  if (path.startsWith("http")) return "Official Documentation";
  return "Marketplace Directory";
}

/** Live catalogue distribution; rows come from priceBreakdown(), never typed in. */
function PriceTable({
  caption,
  group,
  rows,
}: {
  caption: string;
  group: string;
  rows: PriceRow[];
}) {
  if (!rows.length) return null;
  return (
    <section className="reference-card guide-section-card">
      <h2>{caption}</h2>
      <div
        className="directory-table-wrap"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table className="directory-table">
          <caption>
            {caption}: active listings, median and middle-half price range in
            USD
          </caption>
          <thead>
            <tr>
              <th scope="col">{group}</th>
              <th scope="col">Listings</th>
              <th scope="col">Median price</th>
              <th scope="col">Typical range (25th–75th percentile)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.count.toLocaleString("en-US")}</td>
                <td>{usd(row.medianCents)}</td>
                <td>
                  {usd(row.lowCents)}–{usd(row.highCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function Page({ params }: Props) {
  const slug = (await params).slug;
  const guide = buyerGuides.find((item) => item.slug === slug);
  if (!guide) notFound();
  const isDomainGuide = domainGuides.some((item) => item.slug === guide.slug);
  const isCost = guide.slug === "guest-post-cost";
  const [stats, breakdown] = isCost
    ? await Promise.all([
        catalogueSummary("").catch(() => null),
        priceBreakdown().catch(() => null),
      ])
    : [null, null];
  const answer = isCost
    ? costAnswer(
        stats || {
          total: 0,
          minPriceCents: null,
          maxPriceCents: null,
          medianPriceCents: null,
          topCountries: [],
          topTopics: [],
        },
      )
    : guide.answer;
  const image = "/01_guest_post_checklist.png";
  const article = buyerGuideArticleNode({
    ...guide,
    image,
  });

  const totalText = [
    answer,
    ...guide.questions.flatMap((q) => [q.title, q.body]),
    ...(guide.steps || []),
    ...(guide.checklist || []),
    ...(guide.templates || []).flatMap((t) => [t.title, t.text]),
    ...(guide.faq || []).flat(),
  ].join(" ");
  const wordTotal = totalText.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(2, Math.ceil(wordTotal / 190));
  const sourcesCheckedDate = guide.sourcesCheckedAt;

  const tocItems: Array<{ id: string; label: string }> = [
    ...guide.questions.map((section, idx) => ({
      id: `section-${idx + 1}`,
      label: section.title,
    })),
    ...(guide.steps?.length
      ? [{ id: "practice-steps", label: "Put it into practice" }]
      : []),
    ...(guide.templates?.map((template, idx) => ({
      id: `template-${idx + 1}`,
      label: template.title,
    })) || []),
    ...(guide.checklist?.length
      ? [{ id: "decision-checklist", label: "Decision checklist" }]
      : []),
    ...(guide.table
      ? [{ id: "comparison-table", label: `${guide.title} comparison` }]
      : []),
    ...(stats
      ? [{ id: "catalogue-pricing", label: "Guest-post placement prices" }]
      : []),
    ...(guide.faq?.length
      ? [{ id: "common-questions", label: "Common questions" }]
      : []),
    { id: "sources", label: "Sources" },
  ];

  return (
    <InformationShell
      path={`/guides/${guide.slug}/`}
      parent={["Guides", "/guides/"]}
      title={guide.seoTitle || guide.title}
      label={guide.title}
      pill={isDomainGuide ? "Domain Planning Guide" : "Editorial Buyer Guide"}
      description={answer}
      active="guides"
      image={image}
      imageAlt="Illustrated checklist for preparing a guest post placement"
      className="guide-detail-page"
    >
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd([
              article,
              ...(guide.faq?.length
                ? [
                    {
                      "@context": "https://schema.org",
                      ...faqPageNode(guide.faq),
                    },
                  ]
                : []),
            ]),
          }}
        />
      )}

      <div className="guide-meta-strip">
        <div className="guide-meta-badges">
          <Link href="/guides/" className="guide-back-link">
            <ArrowLeft size={14} aria-hidden="true" />
            All Guides
          </Link>
          <span className="guide-meta-pill">
            <Clock size={13} aria-hidden="true" />
            {readingMinutes} min read
          </span>
          <span className="guide-meta-pill">
            <Layers size={13} aria-hidden="true" />
            {guide.questions.length} core sections
          </span>
          <span className="guide-meta-pill guide-meta-verified">
            <ShieldCheck size={13} aria-hidden="true" />
            Sources checked {sourcesCheckedDate}
          </span>
        </div>
        <EditorialByline
          author={guide.author}
          reviewer={guide.reviewer}
          publishedAt={guide.publishedAt}
          updatedAt={guide.updatedAt}
          hideMissingReviewer={!!guide.author}
        />
      </div>

      <div className="reference-guide-layout guide-detail-layout">
        <div className="guide-detail-main">
          <div className="guide-quick-jumps" aria-label="Quick section jumps">
            <span className="guide-quick-jumps-label">
              <Sparkles size={14} aria-hidden="true" />
              Jump to:
            </span>
            <a href="#section-1" className="guide-jump-chip">
              Core questions ({guide.questions.length})
            </a>
            {guide.steps?.length ? (
              <a href="#practice-steps" className="guide-jump-chip">
                Action steps ({guide.steps.length})
              </a>
            ) : null}
            {guide.checklist?.length ? (
              <a href="#decision-checklist" className="guide-jump-chip">
                Decision checklist ({guide.checklist.length})
              </a>
            ) : null}
            {guide.table ? (
              <a href="#comparison-table" className="guide-jump-chip">
                Comparison table
              </a>
            ) : null}
            {guide.faq?.length ? (
              <a href="#common-questions" className="guide-jump-chip">
                FAQs ({guide.faq.length})
              </a>
            ) : null}
            <a href="#sources" className="guide-jump-chip">
              Sources ({guide.sources.length})
            </a>
          </div>

          {guide.questions.map((section, idx) => (
            <section
              id={`section-${idx + 1}`}
              className="reference-card guide-section-card"
              key={section.title}
            >
              <div className="guide-section-heading">
                <span className="guide-section-number" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2>{section.title}</h2>
              </div>
              <p className="guide-section-body">{section.body}</p>
            </section>
          ))}

          {guide.steps && (
            <section
              id="practice-steps"
              className="reference-card guide-steps-card"
            >
              <div className="guide-card-title-row">
                <span className="guide-card-icon" aria-hidden="true">
                  <Compass size={20} />
                </span>
                <div>
                  <p className="eyebrow">Step-by-Step Workflow</p>
                  <h2>Put it into practice</h2>
                </div>
              </div>
              <ol className="guide-step-list">
                {guide.steps.map((step, index) => (
                  <li key={step}>
                    <span className="guide-step-badge" aria-hidden="true">
                      Step {index + 1}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {guide.templates?.map((template, idx) => (
            <section
              id={`template-${idx + 1}`}
              className="reference-card guide-template-card"
              key={template.title}
            >
              <div className="guide-card-title-row">
                <span className="guide-card-icon" aria-hidden="true">
                  <FileCheck2 size={20} />
                </span>
                <div>
                  <p className="eyebrow">Reusable Editorial Template</p>
                  <h2>{template.title}</h2>
                </div>
              </div>
              <pre className="guide-template-pre">{template.text}</pre>
            </section>
          ))}

          {guide.checklist && (
            <section
              id="decision-checklist"
              className="reference-card guide-checklist-card"
            >
              <div className="guide-card-title-row">
                <span
                  className="guide-card-icon guide-card-icon-mint"
                  aria-hidden="true"
                >
                  <ListChecks size={20} />
                </span>
                <div>
                  <p className="eyebrow">Verification Gate</p>
                  <h2>Decision checklist</h2>
                </div>
              </div>
              <ul className="guide-checklist-grid">
                {guide.checklist.map((item) => (
                  <li key={item}>
                    <CheckCircle2
                      size={18}
                      className="guide-check-icon"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {guide.table && (
            <section
              id="comparison-table"
              className="reference-card guide-table-card"
            >
              <div className="guide-card-title-row">
                <span className="guide-card-icon" aria-hidden="true">
                  <BookOpen size={20} />
                </span>
                <div>
                  <p className="eyebrow">Side-by-Side Reference</p>
                  <h2>{guide.title} comparison</h2>
                </div>
              </div>
              <div
                className="directory-table-wrap"
                tabIndex={0}
                role="region"
                aria-label={`${guide.title} comparison`}
              >
                <table className="directory-table">
                  <caption>{guide.title} comparison</caption>
                  <thead>
                    <tr>
                      {guide.table.columns.map((column) => (
                        <th scope="col" key={column}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, index) =>
                          index === 0 ? (
                            <th scope="row" key={index}>
                              {cell}
                            </th>
                          ) : (
                            <td key={index}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {stats && (
            <div id="catalogue-pricing">
              <DirectorySummary
                label="Guest-post placement prices"
                stats={stats}
              />
            </div>
          )}

          {breakdown?.asOf && (
            <>
              <PriceTable
                caption="Placement price by Domain Authority (Moz)"
                group="DA band"
                rows={breakdown.byDa}
              />
              <PriceTable
                caption="Placement price by Domain Rating (Ahrefs)"
                group="DR band"
                rows={breakdown.byDr}
              />
              <PriceTable
                caption="Placement price by listing country"
                group="Country"
                rows={breakdown.byCountry}
              />
              <PriceTable
                caption="Placement price by topic"
                group="Topic"
                rows={breakdown.byTopic}
              />
            </>
          )}

          {(guide.slug === "da-vs-dr-and-traffic" ||
            guide.slug === "vet-a-guest-post-site") && <MetricDefinitions />}

          {guide.faq && (
            <section
              id="common-questions"
              className="reference-card guide-faq-card"
            >
              <div className="guide-card-title-row">
                <span className="guide-card-icon" aria-hidden="true">
                  <HelpCircle size={20} />
                </span>
                <div>
                  <p className="eyebrow">Reader Questions</p>
                  <h2>Common questions</h2>
                </div>
              </div>
              <div className="guide-faq-list">
                {guide.faq.map(([question, faqAnswer]) => (
                  <div className="guide-faq-item" key={question}>
                    <h3>{question}</h3>
                    <p>{faqAnswer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="sources" className="reference-card guide-sources-card">
            <div className="guide-sources-header">
              <div>
                <p className="eyebrow">Primary References & Documentation</p>
                <h2>Sources</h2>
              </div>
              <span className="guide-sources-stamp">
                <ShieldCheck size={14} aria-hidden="true" />
                Sources checked {sourcesCheckedDate}.
              </span>
            </div>
            <ul className="guide-sources-list">
              {guide.sources.map(([label, url]) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <span className="guide-source-label">{label}</span>
                    <span className="guide-source-host">
                      {sourceHost(url)}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside
          className="reference-guide-aside guide-detail-aside"
          aria-label="Guide navigation and tools"
        >
          <nav
            className="reference-card guide-toc-card"
            aria-label="Table of contents"
          >
            <h2>In this guide</h2>
            <ol>
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <section className="reference-card guide-glance-card">
            <h2>Guide overview</h2>
            <dl className="guide-glance-list">
              <div>
                <dt>Core questions</dt>
                <dd>{guide.questions.length}</dd>
              </div>
              {guide.steps?.length ? (
                <div>
                  <dt>Workflow steps</dt>
                  <dd>{guide.steps.length}</dd>
                </div>
              ) : null}
              {guide.checklist?.length ? (
                <div>
                  <dt>Checklist gates</dt>
                  <dd>{guide.checklist.length}</dd>
                </div>
              ) : null}
              <div>
                <dt>Primary sources</dt>
                <dd>{guide.sources.length}</dd>
              </div>
            </dl>
          </section>

          {isDomainGuide ? (
            <section className="reference-card reference-mint-card guide-sidebar-cta">
              <h2>Plan your domain</h2>
              <p>
                Compare domain structure, registration hygiene, and migration
                checklists before switching addresses.
              </p>
              <Link className="button button-primary" href="/domain-names/">
                Domain planning hub ↗
              </Link>
              <p>
                Or inspect character counts with the{" "}
                <Link href="/domain-length-checker/">
                  domain length checker
                </Link>
                .
              </p>
            </section>
          ) : (
            <section className="reference-card reference-mint-card guide-sidebar-cta">
              <h2>Apply this checklist</h2>
              <p>
                Filter publications by topic, country, placement price, and
                owner-supplied authority metrics.
              </p>
              <Link className="button button-primary" href="/">
                Browse marketplace ↗
              </Link>
              <p>
                Or explore the{" "}
                <Link href="/guest-posting-sites/">
                  guest posting sites directory
                </Link>{" "}
                and <Link href="/guest-post-prices/">price bands</Link>.
              </p>
            </section>
          )}
        </aside>
      </div>

      {isDomainGuide && (
        <section className="reference-card guide-related-section">
          <p className="eyebrow">Domain Architecture & Registration</p>
          <h2>Continue planning your domain</h2>
          <div className="guide-related-grid">
            <Link href="/domain-names/" className="guide-related-card">
              <span className="guide-related-badge">Domain Hub</span>
              <strong>Domain planning hub</strong>
              <span className="guide-related-action">
                Explore hub <ChevronRight size={14} aria-hidden="true" />
              </span>
            </Link>
            <Link href="/domain-length-checker/" className="guide-related-card">
              <span className="guide-related-badge">SEO Tool</span>
              <strong>Domain name length checker</strong>
              <span className="guide-related-action">
                Open tool <ChevronRight size={14} aria-hidden="true" />
              </span>
            </Link>
            {domainGuides
              .filter((item) => item.slug !== guide.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/guides/${item.slug}/`}
                  className="guide-related-card"
                >
                  <span className="guide-related-badge">Domain Guide</span>
                  <strong>{item.title}</strong>
                  <span className="guide-related-action">
                    Read guide <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {guide.related && (
        <section className="reference-card guide-related-section">
          <p className="eyebrow">Next Steps & Related Guides</p>
          <h2>Continue with this decision</h2>
          <div className="guide-related-grid">
            {guide.related.map(([label, path]) => (
              <Link key={path} href={path} className="guide-related-card">
                <span className="guide-related-badge">
                  {relatedCategory(path)}
                </span>
                <strong>{label}</strong>
                <span className="guide-related-action">
                  Open resource <ChevronRight size={14} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!isDomainGuide && (
        <section className="reference-card guide-closing-cta">
          <div>
            <p className="eyebrow">Ready to choose a relevant publication?</p>
            <h2>Which publications should I compare next?</h2>
            <p>
              <Link href="/guest-posting-sites/">
                Compare guest posting sites by niche
              </Link>
              ,{" "}
              <Link href="/guest-posting-sites-under-50/">
                browse placement prices up to $50
              </Link>
              , or <Link href="/">review the full active catalogue</Link>.
            </p>
            {isCost && (
              <p>
                Compare by budget:{" "}
                <Link href="/guest-posting-sites-under-100/">up to $100</Link>,{" "}
                <Link href="/price-100-to-300/">$100 to $300</Link> or{" "}
                <Link href="/price-300-plus/">over $300</Link>. Prices are
                supplied asking prices, not total campaign budgets.
              </p>
            )}
          </div>
          <div className="guide-closing-actions">
            <Link
              className="button button-primary"
              href="/guest-posting-sites/"
            >
              Browse guest posting sites
            </Link>
            <Link
              className="button button-secondary"
              href="/guest-post-prices/"
            >
              View price tiers
            </Link>
          </div>
        </section>
      )}
    </InformationShell>
  );
}

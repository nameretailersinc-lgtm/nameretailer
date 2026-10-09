import { MetricDefinitions } from "@/components/site/metric-definitions";
import { breadcrumbSchema, serializeJsonLd } from "@/lib/seo/json-ld";
import { EditorialByline } from "@/components/site/editorial-byline";
import { buyingGuideEditorial } from "@/lib/site/editorial";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, CheckCheck, FileText } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
const baseMetadata: Metadata = {
  title: "How to Evaluate and Buy Guest Post Sites",
  description:
    "A buying checklist for guest posts and sponsored links: audience relevance, supplied metrics, content scope and paid-link disclosure, explained step by step.",
};
const sections = [
  ["audience", "Define your audience"],
  ["metrics", "Understand metrics"],
  ["disclosure", "Disclose paid links"],
  ["scope", "Review the order"],
] as const;
export default function Page() {
  return (
    <div className="reference-site reference-article">
      <SiteHeader active="guides" />
      <main id="main" className="reference-container" tabIndex={-1}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              breadcrumbSchema([
                ["Home", "/"],
                ["Guides", "/guides/"],
                ["Buying guide", "/how-to-buy-links/"],
              ]),
            ),
          }}
        />
        <nav className="reference-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/guides/">Guides</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Buying guide</span>
        </nav>
        <section className="reference-page-hero">
          <div>
            <p className="reference-pill">Buyer’s guide</p>
            <h1>How to evaluate and buy guest post sites</h1>
            <p className="reference-lead">
              Define the audience and purpose first. Review the publication’s
              content, metric sources, placement scope and disclosure before you
              commit to an order.
            </p>
            <p className="reference-article-meta">
              <FileText size={16} aria-hidden="true" />
              <span>Buyer’s checklist</span>
            </p>
          </div>
          <Image
            src="/01_guest_post_checklist.png"
            width={730}
            height={550}
            sizes="(max-width:800px) calc(100vw - 48px), (max-width:1280px) 45vw, 540px"
            alt=""
            preload
          />
        </section>
        <EditorialByline {...buyingGuideEditorial} />
        <MetricDefinitions />
        <div className="reference-guide-layout">
          <article aria-label="Buying checklist">
            <div className="reference-takeaways">
              <CheckCheck size={29} aria-hidden="true" />
              <div>
                <h2>Keep these three things in view</h2>
                <ul>
                  <li>
                    Audience relevance matters alongside authority scores.
                  </li>
                  <li>
                    A metric without a source and date is incomplete evidence.
                  </li>
                  <li>
                    Agree the content, cost and paid-link disclosure before
                    purchase.
                  </li>
                </ul>
              </div>
            </div>
            <section className="reference-guide-section" id="audience">
              <span aria-hidden="true">01</span>
              <h2>What should you decide before choosing a site?</h2>
              <p>
                Write down who you want to reach, what topic your article will
                cover and what a useful outcome means for your campaign. A
                publication should make sense for that audience. Set a budget
                and check whether writing, editorial changes and placement are
                included before comparing prices.
              </p>
              <p>
                Your shortlist should begin with the publication itself. Read
                recent articles, look for an identifiable editorial team and
                consider whether the proposed topic belongs beside the content
                already published. A score cannot answer those questions for
                you.
              </p>
            </section>
            <section className="reference-guide-section" id="metrics">
              <span aria-hidden="true">02</span>
              <h2>Which metrics are useful?</h2>
              <p>
                Metrics can help compare candidates, but each needs its own
                definition. Ahrefs describes Domain Rating as a relative measure
                of backlink-profile strength on a 0–100 scale. That is not an
                audience measurement or a publication-quality certification.
              </p>
              <p>
                Ask which provider supplied each score or traffic estimate and
                when it was observed. Keep missing values separate from zero.
                Review the publication’s content and relevance alongside the
                numbers.
              </p>
              <div
                className="reference-guide-table"
                role="region"
                aria-label="Publication comparison checklist"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Check</th>
                      <th scope="col">Question to ask</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "Audience",
                        "Does the topic, language and geography fit?",
                      ],
                      ["Metrics", "Which provider measured this, and when?"],
                      [
                        "Editorial",
                        "Does the publication show consistent, useful content?",
                      ],
                      [
                        "Scope",
                        "What does the price include, and what is excluded?",
                      ],
                    ].map(([label, question]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{question}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Definition:{" "}
                <a href="https://help.ahrefs.com/en/articles/1409408-what-is-domain-rating-dr">
                  Ahrefs’ Domain Rating guide
                </a>
                .
              </p>
            </section>
            <section className="reference-guide-section" id="disclosure">
              <span aria-hidden="true">03</span>
              <h2>How should paid links be disclosed?</h2>
              <p>
                Google treats buying links to manipulate rankings as link spam.
                Advertising and sponsorship links need appropriate
                qualification: <code>{'rel="sponsored"'}</code> is recommended
                for paid placements, and <code>{'rel="nofollow"'}</code> is also
                acceptable. Discuss link attributes before agreeing to a
                placement; do not promise ranking improvements.
              </p>
              <p className="reference-guide-source">
                Sources:{" "}
                <a href="https://developers.google.com/search/docs/essentials/spam-policies#link-spam">
                  Google Search link-spam policies
                </a>{" "}
                and{" "}
                <a href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links">
                  Google’s guidance on qualifying outbound links
                </a>
                . Final wording requires editorial review before publication.
              </p>
            </section>
            <section className="reference-guide-section" id="scope">
              <span aria-hidden="true">04</span>
              <h2>What should be clear before checkout?</h2>
              <ol>
                <li>
                  <strong>Content scope.</strong> Confirm who writes, who edits
                  and how revisions are handled.
                </li>
                <li>
                  <strong>Placement terms.</strong> Confirm the publication,
                  link attributes and any duration commitment.
                </li>
                <li>
                  <strong>Total cost.</strong> Check currency, fees and whether
                  billing recurs.
                </li>
                <li>
                  <strong>Delivery and recovery.</strong> Read the actual
                  turnaround, cancellation, refund and replacement terms.
                </li>
              </ol>
              <p>
                Keep the brief and agreed terms with the order. If a listing
                changes price or becomes unavailable, review the change before
                payment. The current planning cart shows changes, but saving it
                does not reserve a publication, create an order or take payment.
              </p>
            </section>
          </article>
          <aside
            className="reference-guide-aside"
            aria-label="Guide navigation and related resources"
          >
            <div className="reference-card">
              <h2>In this guide</h2>
              <ol>
                {sections.map(([id, title]) => (
                  <li key={id}>
                    <a href={`#${id}`}>{title}</a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="reference-card reference-mint-card">
              <BookOpen size={30} aria-hidden="true" />
              <h2>New to guest-post placements?</h2>
              <p>Learn the key questions before comparing publications.</p>
              <Link className="button button-secondary" href="/">
                Browse publications{" "}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="reference-card">
              <h2>Related resources</h2>
              <Link href="/guest-posting-sites/">
                Guest posting sites by niche
              </Link>
              <Link href="/price-0-to-50/">Guest posting sites under $50</Link>
              <Link href="/guest-post-by-dr/">Domain Rating marketplace</Link>
              <Link href="/bulk-domain-rating-checker/">
                Bulk Domain Rating checker
              </Link>
              <Link href="/word-counter/">Word counter</Link>
              <Link href="/#marketplace-help">Marketplace questions</Link>
            </div>
          </aside>
        </div>
        <section className="reference-guide-cta">
          <div>
            <p className="eyebrow">Continue with context</p>
            <h2>Explore publication listings</h2>
            <p>
              Use the checklist when comparing publications. Missing metrics
              remain unavailable, not zero.
            </p>
            <Link href="/" className="button button-primary">
              Explore publications <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <Image
            src="/03_listing_browser_panel.png"
            width={880}
            height={405}
            sizes="(max-width:800px) 100vw, 40vw"
            alt=""
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/how-to-buy-links/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: {
        ...(facets.robots as object),
        ...(baseMetadata.robots as object),
      },
    },
    "/how-to-buy-links/",
  );
}

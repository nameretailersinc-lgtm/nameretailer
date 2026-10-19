import { RelatedResearch } from "@/components/site/related-research";
import { GuestPostBudgetWorksheet } from "@/components/site/guest-post-budget-worksheet";
import { budgetWorksheetEditorial } from "@/lib/blog/editorial";
import { EditorialByline } from "@/components/site/editorial-byline";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { blogRouteMetadata } from "@/lib/blog/seo";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Layers,
} from "lucide-react";
import { articleArtwork, articleWithArtwork } from "@/lib/blog/artwork";
import { notFound } from "next/navigation";
import { InformationShell } from "@/components/site/information-page";
import { getBlogArticle, articleContext } from "@/lib/blog/queries";
import {
  sanitizeBody,
  bodyText,
  isSafeUrl,
  wordCount,
} from "@/lib/cms/content";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  completeArticleSchema,
  faqSchema,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Official Reference";
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const record = await getBlogArticle((await params).slug);
  if (!record) notFound();
  const illustrated = articleWithArtwork(record);
  const metadata = buildSeoMetadata(illustrated);
  const artwork = articleArtwork(record);
  const localArtwork = illustrated.data.ogImage === artwork.src;
  return pageMetadata(
    {
      ...metadata,
      ...blogRouteMetadata(record, await searchParams),
      ...(localArtwork
        ? {
            openGraph: {
              ...metadata.openGraph,
              images: undefined,
            },
            twitter: {
              ...metadata.twitter,
              card: "summary_large_image" as const,
              images: undefined,
            },
          }
        : {}),
    },
    `/${record.slug}/`,
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = await getBlogArticle((await params).slug);
  if (!article) notFound();
  const context = await articleContext(article);
  const artwork = articleArtwork(article);
  const schema = completeArticleSchema(
    articleWithArtwork(article),
    context.author || undefined,
  );
  const schemas = [schema, faqSchema(article)].filter(Boolean);
  const headings: Array<{ id: string; label: string }> = [];
  const html = sanitizeBody(String(article.data.body || "")).replace(
    /<h2>(.*?)<\/h2>/g,
    (_, text: string) => {
      const id = `section-${headings.length + 1}`;
      headings.push({ id, label: bodyText(text) });
      return `<h2 id="${id}">${text}</h2>`;
    },
  );
  const wordsTotal = wordCount(html);
  const readTimeMin = Math.max(1, Math.ceil(wordsTotal / 200));
  const date =
    typeof article.data.publishedAt === "string" &&
    Number.isFinite(Date.parse(article.data.publishedAt))
      ? article.data.publishedAt
      : undefined;
  const sources = Array.isArray(article.data.sources)
    ? article.data.sources.filter(
        (source): source is { label: string; url: string } =>
          !!source &&
          typeof source.label === "string" &&
          typeof source.url === "string" &&
          isSafeUrl(source.url, false),
      )
    : [];

  const categoryLabel = context.categories[0]?.title || "Journal Guide";

  return (
    <InformationShell
      path={`/${article.slug}/`}
      parent={["Blog", "/blog/"]}
      title={article.title}
      label={categoryLabel}
      description={String(article.data.excerpt || "")}
      active="guides"
      image={artwork.src}
      imageDimensions={{ width: artwork.width, height: artwork.height }}
      imageAlt={artwork.alt}
      className="journal-article guide-detail-page"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemas) }}
      />

      <div className="reference-article-meta journal-meta">
        <Link href="/blog/" className="guide-back-link">
          <ArrowLeft size={14} aria-hidden="true" />
          Journal
        </Link>
        {date && (
          <time dateTime={date} className="guide-meta-item">
            <Clock size={13} aria-hidden="true" />
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        )}
        <span className="guide-meta-item">
          <FileText size={13} aria-hidden="true" />
          {wordsTotal.toLocaleString()} words
        </span>
        <span className="guide-meta-item">
          <Clock size={13} aria-hidden="true" />
          {readTimeMin} min read
        </span>
      </div>

      <EditorialByline
        author={
          context.author
            ? String(context.author.data.name || context.author.title)
            : undefined
        }
        reviewer={
          context.reviewer
            ? String(context.reviewer.data.name || context.reviewer.title)
            : undefined
        }
        updatedAt={article.updatedAt}
      />

      <div className="reference-guide-layout journal-layout guide-detail-layout">
        <article
          className="journal-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="reference-guide-aside journal-aside">
          <section className="reference-card guide-toc-card">
            <div className="guide-toc-header">
              <Compass size={17} aria-hidden="true" />
              <h2>In this guide</h2>
            </div>
            <ol>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.label}</a>
                </li>
              ))}
            </ol>
          </section>

          <section className="reference-card guide-glance-card">
            <div className="guide-glance-header">
              <Layers size={17} aria-hidden="true" />
              <h2>At a glance</h2>
            </div>
            <dl className="guide-glance-list">
              <div>
                <dt>Total words</dt>
                <dd>{wordsTotal.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Reading time</dt>
                <dd>{readTimeMin}m</dd>
              </div>
              <div>
                <dt>Sections</dt>
                <dd>{headings.length}</dd>
              </div>
              <div>
                <dt>Sources</dt>
                <dd>{sources.length}</dd>
              </div>
            </dl>
          </section>

          <section className="reference-card guide-sidebar-cta reference-mint-card">
            <h2>Apply to your campaign</h2>
            <p>
              Compare guest posting sites with transparent prices, domain metrics and supplied topics.
            </p>
            <Link className="button button-primary" href="/">
              Browse publications <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <p className="guide-sidebar-subtext">
              Or start with a{" "}
              <Link href="/guest-posting-sites/">
                guest posting sites directory
              </Link>{" "}
              by niche, country or budget.
            </p>
          </section>
        </aside>
      </div>

      {Array.isArray(article.data.faq) && article.data.faq.length > 0 && (
        <section className="reference-tool-faq guide-faq-card">
          <div className="guide-faq-header">
            <HelpCircle size={20} aria-hidden="true" />
            <div>
              <h2>Frequently asked questions</h2>
              <p>Practical answers to common technical and editorial questions.</p>
            </div>
          </div>
          <div className="guide-faq-accordion">
            {article.data.faq
              .filter(
                (item: unknown): item is { question: string; answer: string } =>
                  !!item &&
                  typeof item === "object" &&
                  "question" in item &&
                  "answer" in item &&
                  typeof item.question === "string" &&
                  typeof item.answer === "string",
              )
              .map((item) => (
                <details className="guide-faq-item" key={item.question}>
                  <summary>
                    <span>{bodyText(item.question)}</span>
                    <ChevronRight size={16} aria-hidden="true" className="guide-faq-chevron" />
                  </summary>
                  <p>{bodyText(item.answer)}</p>
                </details>
              ))}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="reference-card journal-sources guide-sources-card">
          <div className="guide-sources-header">
            <div>
              <p className="eyebrow">Documentation &amp; Standards</p>
              <h2>Sources and further reading</h2>
            </div>
          </div>
          <ul className="guide-sources-list">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <span className="guide-source-label">{source.label}</span>
                  <span className="guide-source-host">
                    {sourceHost(source.url)}
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {article.slug === budgetWorksheetEditorial.slug && (
        <GuestPostBudgetWorksheet />
      )}

      <RelatedResearch />

      <section className="reference-card guide-closing-cta">
        <div>
          <h2>Ready to plan your publication campaign?</h2>
          <p>
            Compare publications across DA, DR, traffic estimates and listed placement prices, or explore our free technical SEO tools.
          </p>
        </div>
        <div className="guide-closing-actions">
          <Link
            className="button button-primary"
            href="/guest-posting-sites/"
          >
            Browse guest posting sites <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" href="/seo-tools/">
            Free SEO tools
          </Link>
        </div>
      </section>

      <section className="reference-information-next guide-related-section">
        <p className="eyebrow">Continue with context</p>
        <h2>Related reading</h2>
        <div className="reference-three-grid journal-grid">
          {context.related.map((record) => (
            <article className="reference-card journal-card" key={record.id}>
              <div className="journal-card-media" aria-hidden="true">
                <Image
                  src={articleArtwork(record).src}
                  width={256}
                  height={256}
                  alt=""
                  sizes="176px"
                />
              </div>
              <h3>{record.title}</h3>
              <p className="journal-card-excerpt">
                {String(record.data.excerpt || "")}
              </p>
              <Link href={`/${record.slug}/`} className="guide-related-action">
                Read the guide <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className="reference-actions">
          <Link className="button button-secondary" href="/blog/">
            Explore all articles
          </Link>
          <Link className="button button-secondary" href="/guides/">
            Buyer guides
          </Link>
        </div>
      </section>
    </InformationShell>
  );
}

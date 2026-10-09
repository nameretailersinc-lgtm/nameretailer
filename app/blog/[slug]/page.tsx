import { EditorialByline } from "@/components/site/editorial-byline";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import Link from "next/link";
import Image from "next/image";
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
  serializeJsonLd,
} from "@/lib/seo/structured-data";
export const dynamic = "force-dynamic";
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
      ...facetMetadata(`/${record.slug}/`, await searchParams),
      ...(localArtwork
        ? {
            openGraph: {
              ...metadata.openGraph,
              images: [
                {
                  url: `https://nameretailer.com${artwork.src}`,
                  width: artwork.width,
                  height: artwork.height,
                  alt: artwork.alt,
                },
              ],
            },
            twitter: { ...metadata.twitter, card: "summary" as const },
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
  // TODO(owner): without verified authorship, omit Article markup rather than fabricate attribution.
  // FAQ rich results are limited to authoritative government and health sites; the visible FAQ stays.
  const schemas = [schema].filter(Boolean);
  const headings: Array<{ id: string; label: string }> = [];
  const html = sanitizeBody(String(article.data.body || "")).replace(
    /<h2>(.*?)<\/h2>/g,
    (_, text: string) => {
      const id = `section-${headings.length + 1}`;
      headings.push({ id, label: bodyText(text) });
      return `<h2 id="${id}">${text}</h2>`;
    },
  );
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
  return (
    <InformationShell
      path={`/${article.slug}/`}
      parent={["Blog", "/blog/"]}
      title={article.title}
      label={context.categories[0]?.title || "Journal guide"}
      description={String(article.data.excerpt || "")}
      active="guides"
      image={artwork.src}
      imageDimensions={{ width: artwork.width, height: artwork.height }}
      imageAlt={artwork.alt}
      className="journal-article"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemas) }}
      />
      <div className="reference-article-meta journal-meta">
        <Link href="/blog/">← Journal</Link>
        {date && (
          <time dateTime={date}>
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        )}
        <span>{Math.max(1, Math.ceil(wordCount(html) / 200))} min read</span>
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
      <div className="reference-guide-layout journal-layout">
        <article
          className="journal-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <aside className="reference-guide-aside journal-aside">
          <section className="reference-card">
            <h2>In this guide</h2>
            <ol>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.label}</a>
                </li>
              ))}
            </ol>
          </section>
          <section className="reference-card reference-mint-card">
            <h2>Apply it to your shortlist</h2>
            <p>
              Keep audience, price and supplied metrics together when comparing
              publications.
            </p>
            <Link className="button button-secondary" href="/">
              Browse publications ↗
            </Link>
            <p>
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
        <section className="reference-tool-faq">
          <h2>Article questions</h2>
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
              <details key={item.question}>
                <summary>{bodyText(item.question)}</summary>
                <p>{bodyText(item.answer)}</p>
              </details>
            ))}
        </section>
      )}
      {sources.length > 0 && (
        <section className="reference-card journal-sources">
          <h2>Sources and further reading</h2>
          <ul>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p>
            Sources support the referenced facts, not a business endorsement or
            promised outcome.
          </p>
        </section>
      )}
      <div className="tool-privacy">
        <p>
          <strong>Editorial note.</strong> Review the stated author, sources and
          publication scope before applying this guidance. Examples are
          illustrative, not customer results. No ranking, citation or commercial
          outcome is guaranteed.
        </p>
      </div>
      <section className="reference-information-next">
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
              <Link href={`/${record.slug}/`}>Read the guide ↗</Link>
            </article>
          ))}
        </div>
        <div className="reference-actions">
          <Link className="button button-primary" href="/blog/">
            Explore all articles
          </Link>
          <Link className="button button-secondary" href="/seo-tools/">
            Try a useful tool
          </Link>
        </div>
      </section>
    </InformationShell>
  );
}

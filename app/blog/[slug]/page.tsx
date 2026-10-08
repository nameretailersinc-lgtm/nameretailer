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
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
import { canonicalOrigin, canonicalUrl } from "@/lib/seo/metadata";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const record = await getBlogArticle((await params).slug);
  if (!record) notFound();
  const illustrated = articleWithArtwork(record);
  const metadata = buildSeoMetadata(illustrated);
  const artwork = articleArtwork(record);
  const localArtwork = illustrated.data.ogImage === artwork.src;
  return {
    ...metadata,
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
  };
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
  const schema = articleSchema(
    articleWithArtwork(article),
    context.author || undefined,
  );
  const fallbackArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": canonicalUrl(article) + "#article",
    headline: article.title,
    description: String(article.data.excerpt || ""),
    mainEntityOfPage: canonicalUrl(article),
    image: `${canonicalOrigin}${artwork.src}`,
    author: { "@id": `${canonicalOrigin}/#organization` },
    publisher: { "@id": `${canonicalOrigin}/#organization` },
    datePublished: String(article.data.publishedAt || article.createdAt),
    dateModified: article.updatedAt,
    inLanguage: "en",
  };
  const schemas = [
    schema || fallbackArticle,
    {
      "@context": "https://schema.org",
      ...breadcrumbSchema([
        ["Home", "/home/"],
        ["Guides", "/guides/"],
        [article.title, `/${article.slug}/`],
      ]),
    },
    faqSchema(article),
  ].filter(Boolean);
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
    typeof article.data.publishedAt === "string"
      ? article.data.publishedAt
      : article.createdAt;
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
        <span>
          By{" "}
          <Link href="/about/">
            {String(context.author?.data.name || "Name Retailer")}
          </Link>
        </span>
        <time dateTime={date}>
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>
        <span>{Math.max(1, Math.ceil(wordCount(html) / 200))} min read</span>
      </div>
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
            <Link className="button button-secondary" href="/products/">
              Browse publications ↗
            </Link>
          </section>
        </aside>
      </div>
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
          <strong>Editorial transparency.</strong>{" "}
          {article.id.startsWith("nr-library-")
            ? "This new organizational guide was prepared with AI assistance. It is not a migrated legacy article or claimed expert-reviewed reporting; owner editorial review remains pending before indexing."
            : "Review the stated author, sources and publication scope before applying this guidance."}{" "}
          Examples are illustrative, not customer results. No ranking, citation
          or commercial outcome is guaranteed.
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

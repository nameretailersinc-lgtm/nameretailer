import { BuyerGuideLinks } from "@/components/site/buyer-guide-links";
import Link from "next/link";
import Image from "next/image";
import { articleArtwork } from "@/lib/blog/artwork";
import { ArrowRight, BookOpen } from "lucide-react";
import { InformationShell } from "./information-page";
import { blogIndex } from "@/lib/blog/queries";
import { categorySlug } from "@/lib/blog/categories";
import {
  articleIndexHref,
  articleIndexOptions,
  articlePageSizes,
  type ArticleSearchParams,
} from "@/lib/blog/index-options";

export async function ArticleLibrary({
  path,
  searchParams,
  categoryTitle,
}: {
  path: string;
  searchParams: Promise<ArticleSearchParams>;
  categoryTitle?: string;
}) {
  const guides = path === "/guides/";
  const options = articleIndexOptions(await searchParams, guides ? 24 : 12);
  const { q, category, pageSize } = options;
  const result = await blogIndex(q, category, options.page, pageSize);
  const page = result.page;
  const href = (next: number) => articleIndexHref(path, options, next);
  return (
    <InformationShell
      path={path}
      parent={categoryTitle ? ["Blog","/blog/"] : undefined}
      title={
        categoryTitle ? `${categoryTitle} articles` : guides
          ? "Practical guides for your next move."
          : "Ideas worth putting into practice."
      }
      label={
        categoryTitle || (guides ? "The Name Retailer guide library" : "The Name Retailer journal")
      }
      description="Explore our SEO, AEO, GEO, content, marketplace and measurement articles. Find clear answers, worked examples and practical checklists—all in one library."
      active="guides"
      image="/01_guest_post_checklist.png"
    >
      <BuyerGuideLinks />
      <form
        className="reference-card journal-search"
        method="get"
        action={path}
        role="search"
        aria-label="Find library articles"
      >
        <label>
          Search articles
          <input
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Search article titles"
          />
        </label>
        <label>
          <span id="article-topic-label">Topic</span>
          <select
            name="category"
            aria-labelledby="article-topic-label"
            defaultValue={category}
          >
            <option value="">All topics</option>
            {category &&
              !result.categories.some((item) => item.id === category) && (
                <option value={category}>Selected topic unavailable</option>
              )}
            {result.categories.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span id="article-page-size-label">Articles per page</span>
          <select
            name="pageSize"
            aria-labelledby="article-page-size-label"
            defaultValue={String(pageSize)}
          >
            {articlePageSizes.map((size) => (
              <option key={size} value={size}>
                {size} articles
              </option>
            ))}
          </select>
        </label>
        <button className="button button-primary">Find articles</button>
        <Link href={path}>Clear filters</Link>
      </form>
      {result.categories.length > 0 && (
        <nav className="journal-topic-links" aria-label="Article topics">
          <Link
            href="/blog/"
            aria-current={!category && !q ? "page" : undefined}
          >
            All topics
          </Link>
          {result.categories.map((topic) => (
            <Link
              key={topic.id}
              href={`/blog/category/${categorySlug(topic)}/`}
              aria-current={category === topic.id ? "page" : undefined}
            >
              {topic.title}
            </Link>
          ))}
        </nav>
      )}
      <div className="tool-workspace-heading journal-count">
        <h2>Explore the library</h2>
        <p>
          {result.total
            ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, result.total)} of ${result.total} articles`
            : "0 articles"}{" "}
          · Page {page} of {result.pages}
        </p>
      </div>
      {result.data.length ? (
        <div
          className="reference-three-grid journal-grid"
          aria-label="Library articles"
        >
          {result.data.map((article, index) => {
            const topic = result.categories.find(
              (item) =>
                Array.isArray(article.data.categoryIds) &&
                article.data.categoryIds.includes(item.id),
            );
            const artwork = articleArtwork(article);
            return (
              <article className="reference-card journal-card" key={article.id}>
                <div className="journal-card-media" aria-hidden="true">
                  <Image
                    src={artwork.src}
                    width={artwork.width}
                    height={artwork.height}
                    alt=""
                    sizes="176px"
                  />
                </div>
                <p className="eyebrow">{topic?.title || "Journal"}</p>
                <span className="journal-card-number" aria-hidden="true">
                  {String((page - 1) * pageSize + index + 1).padStart(2, "0")}
                </span>
                <h3>
                  <Link href={`/${article.slug}/`}>{article.title}</Link>
                </h3>
                <p className="journal-card-excerpt">
                  {String(article.data.excerpt || "")}
                </p>
                <Link className="journal-read" href={`/${article.slug}/`}>
                  Read the guide <span aria-hidden="true">↗</span>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="reference-card journal-empty">
          <h2>No articles match this search</h2>
          <p>Try another title or topic, or clear your filters.</p>
          <Link className="button button-secondary" href={path}>
            View all articles
          </Link>
        </section>
      )}
      <nav className="journal-pagination" aria-label="Article pagination">
        {page > 1 && (
          <Link className="button button-secondary" href={href(page - 1)}>
            Previous articles
          </Link>
        )}
        {Array.from(
          new Set(
            [1, page - 1, page, page + 1, result.pages].filter(
              (item) => item >= 1 && item <= result.pages,
            ),
          ),
        )
          .sort((a, b) => a - b)
          .map((item) => (
            <Link
              key={item}
              className={`button button-${item === page ? "primary" : "secondary"}`}
              aria-label={`Article page ${item}`}
              aria-current={item === page ? "page" : undefined}
              href={href(item)}
            >
              {item}
            </Link>
          ))}
        {page < result.pages && (
          <Link className="button button-secondary" href={href(page + 1)}>
            Next articles
          </Link>
        )}
      </nav>
      <aside className="reference-card journal-buying-guide">
        <BookOpen size={26} aria-hidden="true" />
        <div>
          <h2>Choosing your first publication?</h2>
          <p>Use the buyer’s checklist alongside the article library.</p>
        </div>
        <Link href="/how-to-buy-links/">
          Read the buying guide <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </aside>
      <p className="reference-information-note">
        Examples are illustrative unless an actual source is identified.
      </p>
    </InformationShell>
  );
}

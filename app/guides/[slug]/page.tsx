import Link from "next/link";
import { notFound } from "next/navigation";
import { InformationShell } from "@/components/site/information-page";
import { EditorialByline } from "@/components/site/editorial-byline";
import { DirectorySummary } from "@/components/site/directory-summary";
import { MetricDefinitions } from "@/components/site/metric-definitions";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
import { priceBreakdown, type PriceRow } from "@/lib/commerce/price-breakdown";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { buyerGuideArticleNode, serializeJsonLd } from "@/lib/seo/json-ld";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
export const dynamic = "force-dynamic";
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
      title: item.title,
      description: item.description,
      ...facets,
      ...(!item.approved ? { robots: { index: false, follow: true } } : {}),
    },
    `/guides/${slug}/`,
  );
}
const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

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
    <section className="reference-card">
      <h2>{caption}</h2>
      <div className="directory-table-wrap">
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
  const isCost = guide.slug === "guest-post-cost";
  const [stats, breakdown] = isCost
    ? await Promise.all([
        catalogueSummary(""),
        priceBreakdown().catch(() => null),
      ])
    : [null, null];
  const answer = stats ? costAnswer(stats) : guide.answer;
  const image = "/01_guest_post_checklist.png";
  const article = buyerGuideArticleNode({
    ...guide,
    image,
  });
  return (
    <InformationShell
      path={`/guides/${guide.slug}/`}
      parent={["Guides", "/guides/"]}
      title={guide.title}
      label={guide.title}
      description={answer}
      active="guides"
      image={image}
    >
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(article) }}
        />
      )}
      <EditorialByline
        author={guide.author}
        reviewer={guide.reviewer}
        publishedAt={guide.publishedAt}
        updatedAt={guide.updatedAt}
        hideMissingReviewer={!!guide.author}
      />
      {guide.questions.map((section) => (
        <section className="reference-card" key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      {guide.table && (
        <div className="directory-table-wrap">
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
                      <th scope="row" key={cell}>
                        {cell}
                      </th>
                    ) : (
                      <td key={cell}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {stats && (
        <DirectorySummary label="Guest-post placement prices" stats={stats} />
      )}
      {breakdown && (
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
      <section className="reference-card">
        <h2>Sources</h2>
        <p>Sources checked October 9, 2026.</p>
        <ul>
          {guide.sources.map(([label, url]) => (
            <li key={url}>
              <a href={url}>{label}</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="reference-card">
        <h2>Which publications should I compare next?</h2>
        <p>
          <Link href="/guest-posting-sites/">
            Compare guest posting sites by niche
          </Link>
          ,{" "}
          <Link href="/guest-posting-sites-under-50/">browse placement prices up to $50</Link>,
          or <Link href="/">review the full active catalogue</Link>.
        </p>
      </section>
    </InformationShell>
  );
}

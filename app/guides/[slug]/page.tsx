import Link from "next/link";
import { notFound } from "next/navigation";
import { InformationShell } from "@/components/site/information-page";
import { EditorialByline } from "@/components/site/editorial-byline";
import { DirectorySummary } from "@/components/site/directory-summary";
import { MetricDefinitions } from "@/components/site/metric-definitions";
import { buyerGuides, costAnswer } from "@/lib/site/buyer-guides";
import { buyerGuideUpdatedAt } from "@/lib/site/buyer-guide-revision";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
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
      description: `${item.title}: catalogue context, comparison questions and cited sources for guest-post buyers.`,
      ...facets,
      ...(!item.approved ? { robots: { index: false, follow: true } } : {}),
    },
    `/guides/${slug}/`,
  );
}
export default async function Page({ params }: Props) {
  const slug = (await params).slug;
  const guide = buyerGuides.find((item) => item.slug === slug);
  if (!guide) notFound();
  const stats =
    guide.slug === "guest-post-cost" ? await catalogueSummary("") : null;
  const answer = stats ? costAnswer(stats) : guide.answer;
  return (
    <InformationShell
      path={`/guides/${guide.slug}/`}
      parent={["Guides", "/guides/"]}
      title={guide.title}
      label={guide.title}
      description={answer}
      active="guides"
      image="/01_guest_post_checklist.png"
    >
      {!guide.approved && (
        <p className="reference-information-note">
          <strong>DRAFT</strong> — This guide is awaiting content approval.
        </p>
      )}
      <EditorialByline
        author={guide.author}
        reviewer={guide.reviewer}
        updatedAt={buyerGuideUpdatedAt}
      />
      {/* TODO(owner): complete Article markup only after real publication and author data are supplied. */}
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
          <Link href="/price-0-to-50/">browse placement prices up to $50</Link>,
          or <Link href="/">review the full active catalogue</Link>.
        </p>
      </section>
    </InformationShell>
  );
}

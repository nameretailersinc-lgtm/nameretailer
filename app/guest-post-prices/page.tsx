import Link from "next/link";
import { connection } from "next/server";
import { InformationShell } from "@/components/site/information-page";
import { DataDisclosure, validAsOf } from "@/components/site/data-disclosure";
import { priceBreakdown, type PriceRow } from "@/lib/commerce/price-breakdown";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { priceGuideEditorial } from "@/lib/site/editorial";
const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const data = await priceBreakdown().catch(() => null);
  return pageMetadata(
    {
      title: "Guest Post Pricing by Niche, DA and Country",
      description:
        "Compare guest post pricing by niche, DA, DR and listing country using dated catalogue medians and price ranges. See what placement prices include and exclude.",
      ...facetMetadata("/guest-post-prices/", await searchParams),
      ...(!validAsOf(data?.asOf)
        ? { robots: { index: false, follow: true } }
        : {}),
    },
    "/guest-post-prices/",
  );
}
function PriceTable({ title, rows }: { title: string; rows: PriceRow[] }) {
  if (!rows.length) return null;
  return (
    <section className="reference-card">
      <h2>{title}</h2>
      <div
        className="directory-table-wrap"
        tabIndex={0}
        role="region"
        aria-label={`${title} table`}
      >
        <table className="directory-table">
          <caption>{title}: USD placement prices</caption>
          <thead>
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Listings</th>
              <th scope="col">Median</th>
              <th scope="col">25th percentile</th>
              <th scope="col">75th percentile</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.count.toLocaleString("en-US")}</td>
                <td>{usd(row.medianCents)}</td>
                <td>{usd(row.lowCents)}</td>
                <td>{usd(row.highCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default async function Page() {
  await connection();
  const result = await priceBreakdown().catch(() => null);
  const data = validAsOf(result?.asOf) ? result : null;
  const summary =
    data && data.medianCents !== null
      ? `Across ${data.total.toLocaleString("en-US")} active USD-priced listings, the median placement price is ${usd(data.medianCents)}. Traffic estimates are supplied for ${data.withTraffic.toLocaleString("en-US")} listings (${data.total ? ((100 * data.withTraffic) / data.total).toFixed(1) : "0"}%). Writing and other campaign costs are separate.`
      : "Compare publication placement prices by niche, authority band and listing country. A dated distribution is unavailable at present; individual listings remain available in the marketplace.";
  return (
    <InformationShell
      path="/guest-post-prices/"
      title="Guest post pricing by niche and metric"
      label="Catalogue price data"
      description={summary}
      active="guides"
      image="/02_content_metrics_panel.png"
    >
      <p className="reference-article-meta">
        Price comparison guidance updated{" "}
        <time dateTime={priceGuideEditorial.updatedAt}>
          {new Date(priceGuideEditorial.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </time>
        . Catalogue observation dates are shown separately below.
      </p>
      {data && (
        <>
          <DataDisclosure asOf={data.asOf} />
          <PriceTable title="Prices by niche" rows={data.byTopic} />
          <PriceTable
            title="Prices by Domain Authority band"
            rows={data.byDa}
          />
          <PriceTable title="Prices by listing country" rows={data.byCountry} />
          <PriceTable title="Prices by Domain Rating band" rows={data.byDr} />
        </>
      )}
      <section className="reference-card">
        <h2>How to compare guest post prices</h2>
        <ol>
          <li>
            Start with the niche and audience you need. Compare publications
            serving a similar topic and language.
          </li>
          <li>
            Read the median alongside the 25th and 75th percentiles. Use that
            range to compare the middle of the distribution; it does not show
            the cheapest and most expensive placements.
          </li>
          <li>
            Check each candidate’s current detail page. Confirm writing,
            editorial revisions, link qualification and timing separately from
            the placement amount.
          </li>
          <li>
            Use supplied DA, DR and traffic as supporting comparison fields. A
            higher price or score does not establish editorial quality, verified
            readers or a ranking benefit.
          </li>
        </ol>
        <p>
          A low listing price can still be expensive for an irrelevant audience.
          Read the{" "}
          <Link href="/guides/vet-a-guest-post-site/">
            publisher evaluation checklist
          </Link>{" "}
          before choosing solely by budget.
        </p>
      </section>
      <section className="reference-card">
        <h2>Placement price versus your total guest posting budget</h2>
        <p>
          This report measures the supplied placement price. It does not quote a
          managed outreach service, campaign package or total project cost.
          Writing options, when offered, are separate. Your own research,
          editorial work and applicable agreed charges can also affect the
          total. Missing charges must be confirmed, rather than treated as zero.
        </p>
        <p>
          For a small-business budget, start with the{" "}
          <Link href="/guest-posting-sites-under-50/">
            up-to-$50 placement directory
          </Link>{" "}
          and review the exclusions in the{" "}
          <Link href="/guides/guest-post-cost/">guest post cost guide</Link>. A
          saved plan does not reserve a publication or its current price.
        </p>
      </section>
      <section className="reference-card">
        <h2>Methodology and refresh</h2>
        <p>
          The report selects active listings from committed imports, plus active
          records without an import, with a numeric nonnegative USD placement
          price. Each record is counted once. Country and topic groups omit
          missing values; topic groups also omit generic categories. DA uses
          bands 1–9, 10–19 through 90–100; DR uses 0–19, 20–49, 50–69 and
          70–100. Records without a valid score are excluded from that score’s
          grouping.
        </p>
        <p>
          The median is the middle sorted price, or the mean of the two middle
          prices. Each percentile selects the zero-based sorted index
          floor(record count × percentile), capped at the final index. Groups
          with fewer than 15 records are omitted. Traffic coverage counts
          supplied numeric nonnegative traffic values, including zero; this does
          not verify measured visits.
        </p>
        <p>
          The report refreshes on requests after a 15-minute cache period. If
          the database fails, the last successful snapshot may remain for up to
          24 hours. The as-of date is the latest actual listing update in that
          snapshot, rather than the time you opened the page.
        </p>
        <h2>How to interpret the figures</h2>
        <p>
          These are listing prices, not completed transaction prices or
          quotations. A country field does not establish reader location. Topic,
          authority and traffic may have different providers or observation
          dates. Multiple listings can refer to one publisher, and group
          distributions do not establish why prices differ. Confirm price,
          writing scope, timing and sponsored-link qualification before planning
          a placement.
        </p>
      </section>
      <section className="reference-card">
        <h2>Compare and plan</h2>
        <p>
          Use the <Link href="/blog/a-practical-guest-post-budget-worksheet/">existing budget worksheet</Link> to record total costs, compare <Link href="/guides/free-vs-paid-guest-posting/">free and paid contributions</Link>, then define <Link href="/guides/measure-guest-posting-results/">how you will measure results</Link> before committing to a placement.
        </p>
        <p>
          <Link href="/guest-posting-sites/">
            Explore publications by niche
          </Link>
          ,{" "}
          <Link href="/guides/guest-post-cost/">
            understand guest post costs
          </Link>
          , or{" "}
          <Link href="/guides/da-vs-dr-and-traffic/">
            compare DA, DR and traffic
          </Link>
          .
        </p>
      </section>
    </InformationShell>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { InformationShell } from "@/components/site/information-page";
import { DataDisclosure } from "@/components/site/data-disclosure";
import { ContentSections, PageFaq, PriceTable } from "@/components/site/seo-content";
import { priceBreakdown, priceReportReady } from "@/lib/commerce/price-breakdown";
import { seoCatalogue, money, count } from "@/lib/commerce/seo-catalogue";
import { cleanListing } from "@/lib/commerce/listing-hygiene";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { askingPriceLabel, priceSections } from "@/lib/site/seo-content";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const data = await priceBreakdown().catch(() => null);
  const year = data?.asOf ? new Date(data.asOf).getUTCFullYear() : null;
  return pageMetadata({
    title: year ? `Guest Post Prices ${year}: Median Cost by DR, Niche & Country` : "Guest Post Prices: Compare Costs by DR, Niche & Country",
    description: data?.medianCents != null ? `Guest post price data from ${count(data.total)} supplied listings. Median ${money(data.medianCents)}; compare DR, niche and country. Asking prices, not transactions.` : "Compare guest post placement asking prices by DR band, niche and country. Review medians, quartiles, campaign budgeting and downloadable catalogue summary tables.",
    ...facetMetadata("/guest-post-prices/", await searchParams),
    ...(!priceReportReady(data) ? { robots: { index: false, follow: true } } : {}),
  }, "/guest-post-prices/");
}
export default async function Page() {
  await connection();
  const data = await priceBreakdown().catch(() => null);
  const catalogue = data ? await seoCatalogue().catch(() => null) : null;
  const example = (catalogue?.rows || []).filter(cleanListing).sort((a, b) => a.priceCents - b.priceCents || a.id.localeCompare(b.id)).slice(0, 3);
  const summary = data?.medianCents != null && data.minCents != null && data.maxCents != null
    ? `In our catalogue, the median guest post placement asking price is ${money(data.medianCents)} across ${count(data.total)} listings, ranging from ${money(data.minCents)} to ${money(data.maxCents)}. These are ${askingPriceLabel}; compare the live DR, niche and country groups below before requesting a quote.`
    : "Guest post costs depend on the publication and agreed article scope. Live catalogue prices could not load; confirm individual placement and writing costs in a current quote.";
  const faqs = [
    ["How much does a guest post cost?", data?.medianCents != null ? `The catalogue median placement asking price is ${money(data.medianCents)} across ${count(data.total)} supplied listings. These are asking prices from supplied listings, not transaction prices; writing and other campaign costs need separate confirmation.` : "Live catalogue pricing could not load. Request a quote for the publication and writing scope you need rather than relying on an assumed average."],
    ["Is a $50 guest post worth it?", "Value depends on relevant readers, editorial standards and the complete scope. Review sample articles, audience evidence, sponsorship labels and separate writing costs before judging a placement by its price."],
    ["Why do guest post prices differ so much?", "Supplied scores, audience, topic, country, article format and production requirements can differ. The tables describe asking-price distributions; they do not prove which factor caused a particular fee."],
    ["Do prices include writing?", "This report measures the supplied placement price. Article writing is separate where available; confirm research, editing, revisions and any other charges in your quote."],
    ["Guest post vs link insertion cost?", "The catalogue does not provide a separately classified link-insertion comparison dataset, so no price difference is claimed. Ask for a quote specifying whether the deliverable is a new article or a change to an existing one."],
  ] as const;
  return <InformationShell path="/guest-post-prices/" title="Guest post prices by DR, niche and country" label="Guest post price data" description={summary} active="guides" image="/02_content_metrics_panel.png">
    {data && <>
      <DataDisclosure asOf={data.asOf} />
      {!data.asOf && <p>The latest listing update date is unavailable. The report remains noindex until its date and all required distributions are available.</p>}
      <PriceTable title="Overall guest post placement prices" rows={data.overall} />
      <PriceTable title="Guest post prices by DR band" rows={data.byDr} />
      <PriceTable title="Guest post prices by top niches" rows={data.byTopic} />
      <PriceTable title="Guest post prices by top listing countries" rows={data.byCountry} />
      {priceReportReady(data) && <>
        <p><a href="/guest-post-prices/summary.csv" download>Download the dated price summary tables as CSV</a>. The download uses the same catalogue selection and calculations as these tables.</p>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@type": "Dataset", "@id": `${canonicalOrigin}/guest-post-prices/#dataset`, name: "Name Retailer guest post placement asking prices", description: `USD ${askingPriceLabel}. Active committed catalogue records grouped by DR, niche and listing country; groups below the minimum size are omitted.`, url: `${canonicalOrigin}/guest-post-prices/`, dateModified: data.asOf, creator: { "@type": "Organization", name: "Name Retailer", url: canonicalOrigin }, variableMeasured: ["Listing count", "Median placement asking price in USD", "25th percentile placement asking price in USD", "75th percentile placement asking price in USD"], distribution: { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${canonicalOrigin}/guest-post-prices/summary.csv` } }) }} />
      </>}
    </>}
    <ContentSections sections={priceSections.slice(0, 3)} />
    {example.length > 0 && <section className="reference-card"><h2>Worked example using supplied placement prices</h2><p>This arithmetic uses the lowest-priced clean active listings returned by the catalogue, with ties ordered by listing ID. It illustrates a subtotal, not a recommended shortlist or an accepted offer.</p><ul>{example.map(row => <li key={row.id}>{row.domain.replace(/^https?:\/\//, "")}: {money(row.priceCents)}</li>)}</ul><p>Placement subtotal: {example.map(row => money(row.priceCents)).join(" + ")} = <strong>{money(example.reduce((sum, row) => sum + row.priceCents, 0))}</strong>.</p><p>Total campaign cost = that placement subtotal + quoted writing + agreed revision charges + licensed assets or specialist checks + your hours × your chosen hourly rate. Those additional inputs are unknown here, so this page does not invent an all-inclusive total. Replace them with actual quotes and your own time estimate before approving a budget.</p></section>}
    <ContentSections sections={priceSections.slice(3)} />
    <section className="reference-card"><h2>Methodology, dates and limitations</h2><p>All reported amounts are {askingPriceLabel}. The report reads active USD-priced listings from committed imports and active listings without an import. Prices must be nonnegative safe integers in cents. Each record is counted once; separate records can refer to the same publisher. Topic and country groups omit missing labels, and generic niche categories are excluded.</p><p>The minimum group size is 15 listings. The niche and country tables show up to 10 qualifying groups ordered by count, with alphabetical ties. Valid DR scores are grouped as 0–19, 20–49, 50–69, 70–89 and 90–100. Missing and out-of-range DR values are not included in a DR group. The median is the middle sorted value or the mean of the middle pair. Each percentile uses the zero-based index floor(count × percentile), capped at the final index.</p><p>Data as of is the latest valid listing update in the selected records, not today's date and not a traffic measurement date. Tables are computed from the database for each request. A later CSV request may reflect newer listing changes. These data do not measure accepted quotes, completed transactions or campaign outcomes, and no causal price model is claimed.</p>{data && <p>Data hygiene in this priced catalogue: {count(data.hygiene.hiddenTraffic)} supplied traffic values were hidden as invalid, and {count(data.hygiene.excludedDirectoryRows)} records are excluded from clean directory selections. The price study retains otherwise valid supplied asking prices, including review-domain records; it does not represent them as verified placement offers.</p>}<p>Choose a relevant topic in the <Link href="/guest-posting-sites/">publisher directory</Link>, then <Link href="/guides/da-vs-dr-and-traffic/">interpret DA, DR and traffic separately</Link> before requesting a quote.</p></section>
    <PageFaq items={faqs} />
  </InformationShell>;
}

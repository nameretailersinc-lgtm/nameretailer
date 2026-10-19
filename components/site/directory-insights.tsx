import Link from "next/link";
import { InformationShell } from "./information-page";
import { ContentSections, PageFaq, PriceTable } from "./seo-content";
import { DataDisclosure } from "./data-disclosure";
import { askingPriceLabel, technologySections, saasSections, usaSections } from "@/lib/site/seo-content";
import { seoDirectoryData, count, money, summarizePrices, techSubtopics, type SeoListing } from "@/lib/commerce/seo-catalogue";
import { priceRow, drPriceBands } from "@/lib/commerce/price-breakdown";
import { publicationPath } from "@/lib/commerce/publication-pages";
import type { Directory } from "@/lib/site/directories";

export const hasSeoDirectoryContent = (directory: Directory) => ["technology-guest-posting-sites", "saas-guest-posting-sites", "guest-posting-sites-usa"].includes(directory.slug) || directory.minIndexableListings === 25;
export function directoryFaq(slug: string, median: number | null) : Array<[string, string]> {
  if (slug === "technology-guest-posting-sites") return [
    ["How much does a tech guest post cost?", median === null ? "Current price data could not load. Review an individual listing and request a current quote, including separate writing and review costs." : `The median technology placement asking price in the matching catalogue is ${money(median)}. These are asking prices from supplied listings, not transaction prices; writing and technical review need separate confirmation.`],
    ["Can I include a product link?", "Ask the publisher whether a relevant product reference is acceptable and agree the destination and anchor. Paid links should use sponsored or nofollow qualification; acceptance is not guaranteed."],
    ["Do tech sites require original screenshots or benchmarks?", "Requirements vary. Ask what evidence the proposed section expects, supply only screenshots you can license and benchmark results you actually measured, and explain versions and limitations."],
    ["How long does publication take?", "Review the supplied turnaround field on the individual listing and confirm it in the quote. Timing depends on the publisher and draft readiness; no universal deadline is promised."],
    ["How do I disclose a sponsored post?", "Agree a clear reader-facing sponsorship label with the publisher and separately confirm sponsored or nofollow qualification for paid links. Do this before drafting or payment."],
  ];
  if (slug === "saas-guest-posting-sites") return [
    ["Should a SaaS guest post link to pricing or to a resource?", "Choose the destination that continues the article's task. Documentation, a template or a guide often suits educational content; use pricing only when it is relevant and the editor agrees."],
    ["How many guest posts do I need per month?", "There is no universal quota. Choose a volume you can research, write and measure properly, then adjust using observed audience response and your available budget."],
    ["Do guest posts help SaaS rankings?", "Rankings are not guaranteed. Google may discount links arranged for ranking manipulation, and paid links need qualification. Plan for relevant audience reach and measure actual visits, trials and enquiries."],
    ["Sponsored vs editorial guest post for SaaS?", "A sponsored placement involves payment or another commercial arrangement and should be disclosed appropriately. An unpaid editorial contribution is accepted on editorial terms; neither route guarantees acceptance or search benefit."],
  ];
  return [
    ["Are US guest posting sites better for US SEO?", "A US listing field alone does not establish relevance or ranking value. Prioritise a useful article, suitable readers and evidence for the proposed section's audience; there is no ranking guarantee."],
    ["How do I confirm a site's US audience?", "Ask for the measurement source, reporting period and US share for the section carrying your article. Request state or city detail when needed and record missing evidence as unknown."],
    ["What do US sponsored-content labels look like?", "Discuss clear wording such as Advertisement or Sponsored advertising content and prominent placement with the publisher. Ask qualified counsel what disclosures apply to your arrangement."],
    ["Are prices in USD?", "Yes. The catalogue shows supplied USD placement asking prices. Confirm writing, revisions and other charges in a current quote."],
  ];
}
function ListingTable({ rows }: { rows: SeoListing[] }) {
  const n = (value: number | null | undefined) => value == null ? "Unavailable" : count(value);
  return <div className="directory-table-wrap" tabIndex={0} role="region" aria-label="Publisher comparison"><table className="directory-table"><caption>Supplied publication details and USD placement asking prices</caption><thead><tr>{["Publication", "Category", "DR", "DA", "Traffic estimate", "Placement", "Supplied turnaround"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><th scope="row">{publicationPath(row) ? <Link prefetch={false} href={publicationPath(row)!}>{row.domain.replace(/^https?:\/\//, "")}</Link> : row.domain}</th><td>{row.category}</td><td>{n(row.metrics?.dr)}</td><td>{n(row.metrics?.da)}</td><td>{n(row.metrics?.traffic)}</td><td>{money(row.priceCents)}</td><td>{row.turnaround || "Confirm with publisher"}</td></tr>)}</tbody></table></div>;
}
export async function SeoDirectoryPage({ directory, subtopic }: { directory: Directory; subtopic?: string }) {
  const data = await seoDirectoryData(directory).catch(() => null);
  const stats = data?.summary;
  const rows = [...(data?.rows || [])].sort((a, b) => (b.metrics?.dr ?? -1) - (a.metrics?.dr ?? -1) || a.id.localeCompare(b.id));
  const tech = directory.slug === "technology-guest-posting-sites";
  const saas = directory.slug === "saas-guest-posting-sites";
  const usa = directory.slug === "guest-posting-sites-usa";
  const selected = tech ? techSubtopics.find(topic => topic.label === subtopic) : undefined;
  const displayed = selected ? rows.filter(row => selected.categories.includes(row.category)) : rows;
  const lead = stats && stats.medianCents !== null ? `Compare ${count(stats.count)} matching listings with a median placement asking price of ${money(stats.medianCents)}${stats.minCents !== null ? `, from ${money(stats.minCents)}` : ""}. ${directory.lead}` : directory.lead;
  return <InformationShell path={`/${directory.slug}/`} title={directory.h1} label={directory.label} parent={[usa || tech || saas ? "Guest posting sites" : "US publishers", usa || tech || saas ? "/guest-posting-sites/" : "/guest-posting-sites-usa/"]} description={lead} active="marketplace" image="/03_listing_browser_panel.png">
    {data ? <><DataDisclosure asOf={data.asOf} /><p>{askingPriceLabel}. Metrics are supplied estimates. Listing counts do not establish unique verified publishers.</p></> : <p>Live catalogue data could not load. Request current publication details before planning a placement.</p>}
    {tech && data && <>
      <PriceTable title="Technology guest post prices by DR band" rows={drPriceBands.filter(([low]) => low >= 20).flatMap(([low, high, label]) => priceRow(label, rows.filter(r => r.metrics?.dr != null && r.metrics.dr >= low && r.metrics.dr < high)))} />
      {techSubtopics.map(topic => { const matching = rows.filter(row => topic.categories.includes(row.category)); return <section className="reference-card" key={topic.label}><h2>{topic.label} guest posting listings</h2><p>{topic.description}</p><p>{count(matching.length)} listings match these supplied categories: {topic.categories.join(", ")}. Broad Technology listings are not automatically classified as specialists.</p>{matching.length ? <ListingTable rows={matching.slice(0, 6)} /> : <p>No exact category matches are currently supplied. Ask about editorial coverage before treating a general tech listing as a specialist.</p>}<Link href={`/${directory.slug}/?subtopic=${encodeURIComponent(topic.label)}`}>Browse the {topic.label.toLowerCase()} category matches</Link></section>; })}
    </>}
    {usa && data && <><PriceTable title="US price bands" rows={([[0, 5000, "Under $50"], [5000, 10000, "$50–under $100"], [10000, 25000, "$100–under $250"], [25000, 50000, "$250–under $500"], [50000, Infinity, "$500+"]] as const).flatMap(([low, high, label]) => priceRow(label, rows.filter(r => r.priceCents >= low && r.priceCents < high), 1))} /><section className="reference-card"><h2>Explore a focused US directory</h2><p><Link href="/guest-posting-sites-usa-under-100/">US placements under $100</Link> narrow the placement budget. <Link href="/business-guest-posting-sites-usa/">US business publications</Link> focus on the Business category, while <Link href="/tech-guest-posting-sites-usa/">US technology publications</Link> cover technical and consumer technology categories.</p></section></>}
    <section className="reference-card"><h2>{selected ? `${selected.label}: filtered publishers` : "Publishers to review"}</h2><p>{data ? `${count(displayed.length)} matching clean listings; showing ${count(Math.min(displayed.length, 25))}, ordered by supplied DR. ` : ""}Review-domain records and listings marked for review are excluded from this selection. This screening does not verify publisher authorization.</p>{displayed.length > 0 && <ListingTable rows={displayed.slice(0, 25)} />}{selected && <p><Link href={`/${directory.slug}/`}>Return to all technology listings</Link></p>}</section>
    <ContentSections sections={tech ? technologySections : saas ? saasSections : usa ? usaSections : directory.sections.map(s => ({ title: s.title, paragraphs: [s.body] }))} />
    {saas && <section className="reference-card"><h2>Save the SaaS tracking checklist</h2><p><a href="/downloads/saas-guest-post-checklist.txt" download>Download the audience, pitch and measurement checklist</a> and fill in your own campaign details. It contains no assumed performance results.</p></section>}
    {!tech && !saas && !usa && <p><Link href="/guest-posting-sites-usa/">Compare all US publisher topics and price bands</Link>.</p>}
    <PageFaq items={tech || saas || usa ? directoryFaq(directory.slug, stats?.medianCents ?? null) : directory.faq} />
  </InformationShell>;
}

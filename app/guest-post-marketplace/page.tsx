import Link from "next/link";
import { connection } from "next/server";
import { InformationShell } from "@/components/site/information-page";
import { ContentSections, PageFaq } from "@/components/site/seo-content";
import { DataDisclosure } from "@/components/site/data-disclosure";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { hubSections, hubFaq, askingPriceLabel } from "@/lib/site/seo-content";
import { seoCatalogue, browseBands, summarizePrices, money, count } from "@/lib/commerce/seo-catalogue";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { informationPages } from "@/lib/site/pages";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return pageMetadata({ title: "Guest Post Marketplace: Compare Sites by DR, DA & Price", description: "Browse guest post sites by Domain Rating, Domain Authority, traffic and price. Compare listings and request a placement quote. Metrics are supplied estimates.", ...facetMetadata("/guest-post-marketplace/", await searchParams) }, "/guest-post-marketplace/");
}
export default async function Page() {
  await connection();
  const data = await seoCatalogue().catch(() => null);
  return <InformationShell path="/guest-post-marketplace/" title={informationPages["guest-post-marketplace"].title} description={informationPages["guest-post-marketplace"].description} label="Browse by metric and budget" active="marketplace" image="/15_laptop_dashboard_illustration.png">
    <DataDisclosure asOf={data?.asOf} />
    <section className="reference-card"><h2>Compare live DR and price bands</h2><p>{askingPriceLabel}. Counts refer to active supplied listings, not verified publishers. Price bands do not overlap: the middle band includes $100 and excludes $300.</p>
      {data ? <div className="directory-table-wrap" tabIndex={0} role="region" aria-label="Marketplace bands"><table className="directory-table"><caption>Live catalogue bands: USD placement asking prices</caption><thead><tr><th scope="col">Browse band</th><th scope="col">Listings</th><th scope="col">Median asking price</th></tr></thead><tbody>{browseBands.map(band => { const stats = summarizePrices(data.rows.filter(band.test)); return <tr key={band.label}><th scope="row"><Link href={band.href}>{band.label}</Link></th><td>{count(stats.count)}</td><td>{stats.medianCents === null ? "Unavailable" : money(stats.medianCents)}</td></tr>; })}</tbody></table></div> : <p>Live band statistics could not load. Browse the catalogue and request a current quote.</p>}
    </section>
    <ContentSections sections={hubSections} />
    <PageFaq items={hubFaq} />
  </InformationShell>;
}

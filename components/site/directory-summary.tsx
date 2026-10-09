import { BuyerGuideLinks } from "@/components/site/buyer-guide-links";
import Link from "next/link";
import type { CatalogueStatistics } from "@/lib/commerce/catalogue-statistics";
const usd = (value: number) => new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:3}).format(value/100);
export function DirectorySummary({label, stats}: {label:string; stats:CatalogueStatistics}) {
  return <section className="reference-card directory-summary" aria-label={`${label} catalogue summary`}>
    <h2>{label}: catalogue snapshot</h2>
    <p>{stats.total.toLocaleString("en-US")} active publications match this segment.{stats.minPriceCents !== null && stats.maxPriceCents !== null && stats.medianPriceCents !== null ? ` Placement prices range from ${usd(stats.minPriceCents)} to ${usd(stats.maxPriceCents)}; the median is ${usd(stats.medianPriceCents)}.` : " No placement price distribution is available."}</p>
    {stats.topCountries.length > 0 && <p>Most common listing countries: {stats.topCountries.map(row=>`${row.name} (${row.count})`).join(", ")}.</p>}
    {stats.topTopics.length > 0 && <p>Most common supplied topics: {stats.topTopics.map(row=>`${row.name} (${row.count})`).join(", ")}.</p>}
    {stats.updatedAt && <p>Catalogue last updated: <time dateTime={stats.updatedAt}>{new Date(stats.updatedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</time>.</p>}
    <p>DA, DR and traffic are owner-supplied estimates. Missing values appear as Unavailable. A catalogue update is not a metric measurement date. <Link href="/how-to-buy-links/#metrics">Understand metric sources and missing values</Link>.</p>
    <p><Link href="/guides/">Read guest-post buying guides</Link> and <Link href="/guest-posting-sites/">compare publication directories</Link>.</p>
    <BuyerGuideLinks />
  </section>;
}

import Link from "next/link";
import { faqPageNode, jsonLdGraph, serializeJsonLd } from "@/lib/seo/structured-data";
import { askingPriceLabel, type ContentSection } from "@/lib/site/seo-content";
import { count, money } from "@/lib/commerce/seo-catalogue";
import type { PriceRow } from "@/lib/commerce/price-breakdown";

export function ContentSections({ sections }: { sections: ContentSection[] }) {
  return <>{sections.map(section => <section className="reference-card" key={section.title}>
    <h2>{section.title}</h2>
    {section.paragraphs.map(text => <p key={text} {...(text.startsWith("TODO:") ? { "data-business-todo": true } : {})}>{text}</p>)}
    {section.bullets && <ul>{section.bullets.map(text => <li key={text}>{text}</li>)}</ul>}
    {section.code && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><code>{section.code}</code></pre>}
    {section.links?.map(([label, href]) => <p key={href}><Link href={href}>{label}</Link></p>)}
  </section>)}</>;
}
export function PageFaq({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return <section className="reference-tool-faq reference-information-next"><h2>Common questions</h2>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdGraph(faqPageNode(items))) }} />
    {items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p {...(answer.startsWith("TODO:") ? { "data-business-todo": true } : {})}>{answer}</p></details>)}
  </section>;
}
export function PriceTable({ title, rows }: { title: string; rows: PriceRow[] }) {
  if (!rows.length) return <section className="reference-card"><h2>{title}</h2><p>No groups meet the minimum listing threshold for this table.</p></section>;
  return <section className="reference-card"><h2>{title}</h2><div className="directory-table-wrap" tabIndex={0} role="region" aria-label={title}>
    <table className="directory-table"><caption>{title}: {askingPriceLabel}. USD.</caption><thead><tr><th scope="col">Group</th><th scope="col">Listings</th><th scope="col">Median</th><th scope="col">25th percentile</th><th scope="col">75th percentile</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{count(row.count)}</td><td>{money(row.medianCents)}</td><td>{money(row.lowCents)}</td><td>{money(row.highCents)}</td></tr>)}</tbody></table>
  </div></section>;
}

import { InformationShell } from "@/components/site/information-page";
import { ContentSections, PageFaq } from "@/components/site/seo-content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { workflowSections, workflowFaq } from "@/lib/site/seo-content";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return pageMetadata({ title: "How It Works: Buy a Guest Post Placement Step by Step", description: "See how to find a guest posting site, request a placement, send your brief and get published. Timelines, revisions and sponsored content disclosure explained.", ...facetMetadata("/how-it-works/", await searchParams) }, "/how-it-works/");
}
export default function Page() {
  return <InformationShell path="/how-it-works/" title="How buying a guest post placement works" label="How it works" description="Compare publications, send a placement inquiry and agree the brief and quote before publication. Writing, editorial approval, timing and paid-link disclosure need confirmation for your chosen publisher." active="guides" image="/01_guest_post_checklist.png">
    <ContentSections sections={workflowSections.slice(0, 6)} />
    <section className="reference-card"><h2>What is included and what costs extra?</h2><p>The catalogue supports research and inquiries. Commercial inclusions are established in the quote rather than assumed from a listed placement price.</p><div className="directory-table-wrap" tabIndex={0} role="region" aria-label="Scope and extra costs"><table className="directory-table"><caption>Available planning features and scope to confirm</caption><thead><tr><th scope="col">Item</th><th scope="col">Available or included</th><th scope="col">Extra cost or confirmation</th></tr></thead><tbody>
      <tr><th scope="row">Browse and compare</th><td>Public filters and comparison of up to four publications</td><td>No account needed to browse</td></tr>
      <tr><th scope="row">Placement inquiry</th><td>Submit your contact details and requirements</td><td>Availability and final placement quote need confirmation</td></tr>
      <tr><th scope="row">Article writing</th><td>Separate options where offered</td><td>Priced separately; confirm research and editing scope</td></tr>
      <tr><th scope="row">Revisions and reporting</th><td>Only as agreed in the quote</td><td>Owner policy confirmation is pending; see the TODO markers</td></tr>
    </tbody></table></div></section>
    <ContentSections sections={workflowSections.slice(6)} />
    <PageFaq items={workflowFaq} />
  </InformationShell>;
}

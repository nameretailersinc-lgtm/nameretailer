import Link from "next/link";
import { InformationShell } from "@/components/site/information-page";
import { domainGuides } from "@/lib/site/domain-guides";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

const description =
  "Plan a business domain: choose a memorable name, understand registration, check hostname length and prepare an SEO-conscious website migration.";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return pageMetadata(
    {
      title: "Domain Name Planning: Naming, Registration & SEO",
      description,
      ...facetMetadata("/domain-names/", await searchParams),
    },
    "/domain-names/",
  );
}
export default function Page() {
  return (
    <InformationShell
      path="/domain-names/"
      title="Plan a domain name for your business"
      label="Domain planning"
      description={description}
      active="guides"
      image="/02_content_metrics_panel.png"
    >
      <section className="reference-card">
        <h2>Start with the decision you need to make</h2>
        <p>
          A useful domain is easy for your audience to recognize and manageable
          for your team to maintain. Separate naming, registration and SEO
          checks so one favorable signal does not stand in for all three.
        </p>
        <ol>
          <li>Build and test a shortlist before spending money.</li>
          <li>Check registration and renewal terms with a registrar.</li>
          <li>
            If replacing an existing site, preserve equivalent URLs and plan
            redirects.
          </li>
        </ol>
      </section>
      <div className="reference-three-grid">
        {domainGuides.map((guide) => (
          <section className="reference-card" key={guide.slug}>
            <h2>
              <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
            </h2>
            <p>{guide.description}</p>
          </section>
        ))}
      </div>
      <section className="reference-card">
        <h2>Check a shortlist</h2>
        <p>
          <Link href="/domain-length-checker/">Check domain name length</Link>,
          including internationalized names in ASCII. The tool runs in your
          browser and checks length without making availability or price claims.
        </p>
        <h3>What needs a separate check?</h3>
        <p>
          Confirm availability and eligibility with a registrar. Review name
          rights using relevant business and trademark resources. Inspect
          historical use before buying a previously registered name.
          Registration dates do not prove website age.
        </p>
        <p>
          These English-language resources apply to planning worldwide. Local
          registration rules, currency, taxes and name rights can differ; check
          the relevant providers and authorities for your situation.
        </p>
        <p>
          <Link href="/seo-tools/">Browse related SEO tools</Link> or{" "}
          <Link href="/guides/">read the wider guide library</Link>.
        </p>
      </section>
    </InformationShell>
  );
}

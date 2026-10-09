import Link from "next/link";
import { connection } from "next/server";
import { InformationShell } from "@/components/site/information-page";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { authorPath, authors } from "@/lib/site/authors";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return pageMetadata(
    {
      title: "About Name Retailer: Guest Post Marketplace",
      description:
        "Who runs Name Retailer, where listings and metrics come from, what we check and what we don’t, and how to contact the team in Sharjah, UAE.",
      ...facetMetadata("/about/", await searchParams),
    },
    "/about/",
  );
}

// Only verifiable facts. TODO(owner): legal entity and registration number,
// founding year, team names and roles, and official social profiles (sameAs).
// See OWNER_DECISIONS.md; do not invent them.
export default async function Page() {
  await connection();
  const stats = await catalogueSummary("").catch(() => null);
  const count = stats?.total ? stats.total.toLocaleString("en-US") : null;
  return (
    <InformationShell
      path="/about/"
      title="About Name Retailer"
      label="About"
      description="Name Retailer is a guest post marketplace. We bring publisher-supplied listings into one catalogue so brands, agencies and SEO teams can compare publications by topic, audience, metrics and price before they plan a sponsored placement."
      active="about"
      image="/03_listing_browser_panel.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": `${canonicalOrigin}/about/#page`,
            url: `${canonicalOrigin}/about/`,
            name: "About Name Retailer",
            isPartOf: { "@id": `${canonicalOrigin}/#website` },
            mainEntity: { "@id": `${canonicalOrigin}/#organization` },
          }),
        }}
      />
      <div className="reference-information-sections">
        <section className="reference-card">
          <h2>What Name Retailer does</h2>
          <p>
            Name Retailer runs a marketplace of guest post and sponsored
            placement listings
            {count ? `, currently ${count} active publications` : ""}. Each
            listing shows the publication’s topic, country and language, its
            supplied Domain Authority, Domain Rating and traffic estimate, and a
            USD placement price. You can browse and compare without an account,
            shortlist publications, and save a private placement plan when
            signed in.
          </p>
          <p>
            Article writing is offered separately where a publisher supports it,
            in 500-, 750- and 1,000-word tiers. The placement price never
            includes writing.
          </p>
        </section>
        <section className="reference-card">
          <h2>Where listings and metrics come from</h2>
          <p>
            Listings come from publisher-supplied inventory. Each import is
            validated before it goes live: rows with placeholder, invalid or
            conflicting data are excluded rather than published. Domain
            Authority is Moz’s score and Domain Rating is Ahrefs’; traffic
            figures are supplied estimates. We show missing values as
            unavailable, never as zero.
          </p>
          <p>
            We do not independently re-measure every metric, and we do not
            promise rankings from any placement. The{" "}
            <Link href="/methodology/">methodology page</Link> explains each
            field, how catalogue statistics are calculated and which listings
            get a profile page.
          </p>
        </section>
        <section className="reference-card">
          <h2>Our position on paid links</h2>
          <p>
            A guest post bought through a marketplace is a paid placement.
            Google asks for paid links to be qualified with
            rel=&quot;sponsored&quot; or nofollow, and readers should be able to
            see that content is sponsored. We encourage buyers to agree
            disclosure and link markup with each publisher before ordering; see{" "}
            <Link href="/guides/paid-guest-posts-google-link-policies/">
              paid guest posts and Google’s link policies
            </Link>
            .
          </p>
        </section>
        <section className="reference-card">
          <h2>Who writes our guides</h2>
          <ul>
            {authors.map((author) => (
              <li key={author.slug}>
                <Link href={authorPath(author)}>{author.name}</Link>
                {author.jobTitle ? `, ${author.jobTitle}` : ""} writes the{" "}
                <Link href="/guides/">guest post buying guides</Link>. Every
                guide lists its sources and the date they were checked.
              </li>
            ))}
          </ul>
        </section>
        <section className="reference-card">
          <h2>Contact information</h2>
          <p>Name Retailer</p>
          <address>
            26 - G Hamriyah Freezone
            <br />
            Sharjah, United Arab Emirates
          </address>
          <p>
            <a href="mailto:info@nameretailer.com">info@nameretailer.com</a>
          </p>
          <p>
            Questions about a listing or an order? See the{" "}
            <Link href="/help-center/">help center</Link> or{" "}
            <Link href="/contact/">contact the team</Link>.
          </p>
        </section>
      </div>
    </InformationShell>
  );
}

import { InformationShell } from "@/components/site/information-page";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return pageMetadata(
    {
      title: "About Name Retailer",
      description:
        "Name Retailer is a guest-post marketplace. Contact info@nameretailer.com or find the supplied Sharjah address.",
      ...facetMetadata("/about/", await searchParams),
    },
    "/about/",
  );
}
export default function Page() {
  return (
    <InformationShell
      path="/about/"
      title="About Name Retailer"
      label="About Name Retailer"
      description="Name Retailer is a guest-post marketplace."
      active="about"
      image="/03_listing_browser_panel.png"
    >
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
      </section>
      {/* TODO(owner): legal entity/registration details, team names and bios. See OWNER_DECISIONS.md. */}
    </InformationShell>
  );
}

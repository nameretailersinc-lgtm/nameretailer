import { PlacementInquiry } from "@/components/inquiries/placement-inquiry";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
const baseMetadata: Metadata = {
  title: "Contact Name Retailer: Guest Post Support and Sales",
  description: informationPages.contact.description,
};
export default function Page() {
  return <InformationShell {...informationPages.contact} path="/contact/"><section className="reference-card"><h2>Tell us about your placement</h2><PlacementInquiry label="Request a placement" /></section></InformationShell>;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/contact/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: {
        ...(facets.robots as object),
        ...(baseMetadata.robots as object),
      },
    },
    "/contact/",
  );
}

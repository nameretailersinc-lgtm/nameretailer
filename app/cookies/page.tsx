import { AnalyticsPreferences } from "@/components/site/analytics";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
import { PolicyBlocks } from "@/components/site/policy-blocks";
import { cookiePolicy } from "@/lib/site/legal/cookies";

const baseMetadata: Metadata = {
  title: "Cookie Policy",
  description:
    "The cookies nameretailer.com sets, why, and for how long: essential sign-in cookies and optional consent-based analytics. Control your analytics choice.",
  alternates: { canonical: "https://nameretailer.com/cookies/" },
};

export default function Page() {
  return (
    <InformationShell
      path="/cookies/"
      title="Cookie Policy"
      label="Cookie policy"
      description="Last updated: October 10, 2026. Which cookies Name Retailer uses and how you can control them."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <AnalyticsPreferences />
      <PolicyBlocks blocks={cookiePolicy} />
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/cookies/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: facets.robots,
    },
    "/cookies/",
  );
}

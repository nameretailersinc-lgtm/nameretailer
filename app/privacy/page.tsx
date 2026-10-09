import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
import { PolicyBlocks } from "@/components/site/policy-blocks";
import { privacyPolicy } from "@/lib/site/legal/privacy";

const baseMetadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Name Retailer collects, uses, shares, retains and protects your personal data, your rights to delete it, and how to contact us.",
  alternates: { canonical: "https://nameretailer.com/privacy/" },
};

export default function Page() {
  return (
    <InformationShell
      path="/privacy/"
      title="Privacy Policy"
      label="Privacy policy"
      description="Last updated: February 18, 2025. How Name Retailer collects, uses and protects your personal data."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <PolicyBlocks blocks={privacyPolicy} />
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/privacy/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: facets.robots,
    },
    "/privacy/",
  );
}

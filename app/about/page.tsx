import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
const baseMetadata: Metadata = {
  title: "About Name Retailer: Guest Post Marketplace Team",
  description: informationPages.about.description,
};
export default function Page() {
  return <InformationPageView page={informationPages.about} />;
}

export async function generateMetadata({searchParams}: {searchParams: Promise<SearchParams>}) {const facets=facetMetadata("/about/",await searchParams);return pageMetadata({...baseMetadata, alternates: facets.alternates, robots: {...facets.robots as object,...baseMetadata.robots as object}},"/about/");}

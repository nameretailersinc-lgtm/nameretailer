import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { publicProductPage } from "@/lib/commerce/public-page";
import {
  marketplaceQuery,
  searchQuery,
} from "@/lib/commerce/marketplace-query";
import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { LandingExplore } from "@/components/site/directory-page";
const baseMetadata = {
  title: {
    absolute: "Guest Post Marketplace: Compare Sites | Name Retailer",
  },
  description:
    "Compare active publications by topic, country, DA, DR, traffic and USD price. Shortlist sites, prepare a placement plan and request details from Name Retailer.",
  alternates: { canonical: "https://nameretailer.com/" },
};
export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <ServerMarketplace searchParams={searchParams}>
      <LandingExplore />
    </ServerMarketplace>
  );
}


export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const data = await publicProductPage(
    marketplaceQuery(searchQuery(params)).toString(),
  );
  return pageMetadata(
    {
      ...baseMetadata,
      ...facetMetadata("/", params, data.data.length > 0),
      ...(data.page > 1
        ? {
            title: {
              absolute:
                "Guest Posting Marketplace" +
                " — Page " +
                data.page +
                " | Name Retailer",
            },
            description:
              "Compare publication listings and USD placement prices on page " +
              data.page +
              " of the marketplace.",
          }
        : {}),
    },
    "/",
  );
}

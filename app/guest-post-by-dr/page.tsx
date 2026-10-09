import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import { publicProductPage } from "@/lib/commerce/public-page";
import {
  marketplaceQuery,
  searchQuery,
} from "@/lib/commerce/marketplace-query";
import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

const baseMetadata = {
  title: { absolute: "Guest post sites by Domain Rating" },
  description:
    "Compare active guest-post publications by supplied Domain Rating, audience fit and USD placement price, then shortlist sites that match your campaign.",
  alternates: { canonical: "https://nameretailer.com/guest-post-by-dr/" },
};
export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <ServerMarketplace
      searchParams={searchParams}
      metricView
    ></ServerMarketplace>
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
      ...facetMetadata("/guest-post-by-dr/", params, data.data.length > 0),
      ...(data.page > 1
        ? {
            title: {
              absolute:
                "Guest Post Sites by DR" +
                " — Page " +
                data.page +
                " | Name Retailer",
            },
            description:
              "Compare publication listings and USD placement prices on page " +
              data.page +
              " of the Domain Rating catalogue.",
          }
        : {}),
    },
    "/guest-post-by-dr/",
  );
}

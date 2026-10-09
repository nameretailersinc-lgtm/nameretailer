import { facetMetadata } from "@/lib/seo/facets";
import { publicProductPage } from "@/lib/commerce/public-page";
import { marketplaceQuery, searchQuery } from "@/lib/commerce/marketplace-query";
import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { LandingExplore } from "@/components/site/directory-page";
const baseMetadata = {title: {absolute: "Guest Posting Sites & Marketplace | Name Retailer"}, description: "Compare guest posting sites by niche, country, DA, DR, traffic and price, then shortlist publishers and plan placements with Name Retailer.", alternates: {canonical: "https://nameretailer.com/"}};
export default function Page({searchParams}: {searchParams: Promise<SearchParams>}) {
 return <ServerMarketplace searchParams={searchParams} ><LandingExplore /></ServerMarketplace>;
}

export async function generateMetadata({searchParams}: {searchParams: Promise<SearchParams>}) {const params = await searchParams; const data = await publicProductPage(marketplaceQuery(searchQuery(params)).toString()); return {...baseMetadata, ...facetMetadata("/",params,data.data.length > 0), ...(data.page > 1 ? {title: {absolute: "Guest Posting Marketplace" + " — Page " + data.page + " | Name Retailer"}, description: "Compare publication listings and USD placement prices on page " + data.page + " of the marketplace."} : {})};}

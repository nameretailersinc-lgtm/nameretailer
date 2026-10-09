import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { LandingExplore } from "@/components/site/directory-page";
export const metadata = {title: {absolute: "Guest Posting Sites & Marketplace | Name Retailer"}, description: "Compare guest posting sites by niche, country, DA, DR, traffic and price, then shortlist publishers and plan placements with Name Retailer.", alternates: {canonical: "https://nameretailer.com/"}};
export default function Page({searchParams}: {searchParams: Promise<SearchParams>}) {
 return <ServerMarketplace searchParams={searchParams} ><LandingExplore /></ServerMarketplace>;
}

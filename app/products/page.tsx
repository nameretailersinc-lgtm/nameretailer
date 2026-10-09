import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import { LandingExplore } from "@/components/site/directory-page";
export const metadata = {title: {absolute: "Guest Post Marketplace and Prices"}, description: "Browse guest-post publisher listings by topic, location, language, price and metrics, then plan your placements with Name Retailer.", alternates: {canonical: "https://nameretailer.com/"}};
export default function Page({searchParams}: {searchParams: Promise<SearchParams>}) {
 return <ServerMarketplace searchParams={searchParams} ><LandingExplore /></ServerMarketplace>;
}

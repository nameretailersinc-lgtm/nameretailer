import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";

export const metadata = {title: {absolute: "Guest post sites by Domain Rating"}, description: "Compare active guest-post publications by supplied Domain Rating, audience fit and USD placement price, then shortlist sites that match your campaign.", alternates: {canonical: "https://nameretailer.com/guest-post-by-dr/"}};
export default function Page({searchParams}: {searchParams: Promise<SearchParams>}) {
 return <ServerMarketplace searchParams={searchParams} metricView></ServerMarketplace>;
}

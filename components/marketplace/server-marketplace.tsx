import { connection } from "next/server";
import { Marketplace } from "./marketplace";
import { publicProductPage } from "@/lib/commerce/public-page";
import { marketplaceQuery, searchQuery, type SearchParams } from "@/lib/commerce/marketplace-query";
import type { MarketplaceRange } from "@/lib/commerce/marketplace-ranges";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { DirectorySummary } from "@/components/site/directory-summary";
import { websiteNode, serializeJsonLd } from "@/lib/seo/json-ld";
export async function ServerMarketplace({ searchParams, range, metricView, children }: {
  searchParams: Promise<SearchParams>;
  range?: MarketplaceRange;
  metricView?: boolean;
  children?: React.ReactNode;
}) {
  await connection();
  const query = marketplaceQuery(searchQuery(await searchParams), range);
  // Fresh request-time inventory, with the existing active/committed visibility rules.
  const initialPage = await publicProductPage(query.toString());
  const stats = range ? await catalogueSummary(new URLSearchParams(range.bounds).toString()) : null;
  return <Marketplace range={range} metricView={metricView} initialPage={initialPage} initialQuery={query.toString()}>{!range && !metricView && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(websiteNode())}} />}{stats && range && <DirectorySummary label={range.label} stats={stats} />}{children}</Marketplace>;
}

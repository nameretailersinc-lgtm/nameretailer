import { connection } from "next/server";
import { Marketplace } from "./marketplace";
import { listProducts } from "@/lib/commerce/products";
import { marketplaceQuery, searchQuery, type SearchParams } from "@/lib/commerce/marketplace-query";
import type { MarketplaceRange } from "@/lib/commerce/marketplace-ranges";
export async function ServerMarketplace({ searchParams, range, metricView, children }: {
  searchParams: Promise<SearchParams>;
  range?: MarketplaceRange;
  metricView?: boolean;
  children?: React.ReactNode;
}) {
  await connection();
  const query = marketplaceQuery(searchQuery(await searchParams), range);
  // Fresh request-time inventory, with the existing active/committed visibility rules.
  const initialPage = await listProducts(query);
  return <Marketplace range={range} metricView={metricView} initialPage={initialPage} initialQuery={query.toString()}>{children}</Marketplace>;
}

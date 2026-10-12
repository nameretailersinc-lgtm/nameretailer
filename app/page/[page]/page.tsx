import Homepage, { generateMetadata as homepageMetadata } from "@/app/page";
import { notFound } from "next/navigation";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import {
  marketplaceQuery,
  searchQuery,
} from "@/lib/commerce/marketplace-query";
import { publicProductPage } from "@/lib/commerce/public-page";

type Props = {
  params: Promise<{ page: string }>;
  searchParams: Promise<SearchParams>;
};

async function pageSearchParams({ params, searchParams }: Props) {
  const { page } = await params;
  if (!/^[1-9]\d*$/.test(page) || Number(page) > 10000) notFound();
  const search = { ...(await searchParams), page };
  // Check inventory before rendering a Suspense boundary can commit HTTP 200.
  const data = await publicProductPage(
    marketplaceQuery(searchQuery(search)).toString(),
  );
  if (data.data.length === 0) notFound();
  return search;
}

export async function generateMetadata(props: Props) {
  return homepageMetadata({
    searchParams: Promise.resolve(await pageSearchParams(props)),
  });
}

export default async function Page(props: Props) {
  return (
    <Homepage searchParams={Promise.resolve(await pageSearchParams(props))} />
  );
}

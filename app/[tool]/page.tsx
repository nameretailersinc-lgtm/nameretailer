import { pageMetadata } from "@/lib/seo/page-metadata";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { directoryIndexable } from "@/lib/commerce/catalogue-statistics";
import { facetMetadata } from "@/lib/seo/facets";
import { publicProductPage } from "@/lib/commerce/public-page";
import { marketplaceQuery, searchQuery } from "@/lib/commerce/marketplace-query";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ServerMarketplace } from "@/components/marketplace/server-marketplace";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import {
  marketplaceRanges,
  marketplaceRangeBySlug,
} from "@/lib/commerce/marketplace-ranges";
import {
  ToolHero,
  ToolSteps,
  ToolsNext,
  ToolsShell,
} from "@/components/tools/presentation";
import { ToolWorkspace } from "@/components/tools/workspace";
import { tools, toolBySlug } from "@/lib/tools/catalog";
import { directories, directoryBySlug } from "@/lib/site/directories";
import {
  DirectoryLinks,
  DirectoryPage,
} from "@/components/site/directory-page";
import {
  breadcrumbSchema,
  jsonLdGraph,
  serializeJsonLd,
  webApplicationNode,
} from "@/lib/seo/structured-data";
export function generateStaticParams() {
  return [
    ...marketplaceRanges.map((range) => ({ tool: range.slug })),
    ...directories.map((directory) => ({ tool: directory.slug })),
    ...tools
      .filter((tool) => tool.slug !== "word-counter")
      .map((tool) => ({ tool: tool.slug })),
  ];
}
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tool: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const slug = (await params).tool;
  const range = marketplaceRangeBySlug(slug);
  if (range) {
    await connection();
    const search = await searchParams;
    const data = await publicProductPage(marketplaceQuery(searchQuery(search), range).toString());
    return pageMetadata({
      ...facetMetadata(`/${range.slug}/`, search, data.data.length > 0),
      ...(!directoryIndexable(data.total) ? {robots:{index:false,follow:true}} : {}),
      title: range.title + (data.page > 1 ? ` — Page ${data.page}` : ""),
      description: `Browse active guest-post publications in ${range.label}. Compare audience fit, supplied metrics and USD placement prices, then add placements to your plan.${data.page > 1 ? ` Page ${data.page}.` : ""}`,
    }, `/${range.slug}/`);
  }
  const directory = directoryBySlug(slug);
  if (directory) {
    await connection();
    const stats = await catalogueSummary("", directory.slug);
    return pageMetadata({
      ...facetMetadata(`/${directory.slug}/`, await searchParams),
      ...(!directoryIndexable(stats.total) ? {robots:{index:false,follow:true}} : {}),
      title: directory.metaTitle,
      description: directory.metaDescription,
    }, `/${directory.slug}/`);
  }
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  return pageMetadata({
    title: `${tool.title} – Free Online Tool`,
    description: `${tool.description} A free Name Retailer tool for SEO, content and link-building teams planning guest-post campaigns.`,
    alternates: { canonical: `https://nameretailer.com/${tool.slug}/` },
  }, `/${tool.slug}/`);
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ tool: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const slug = (await params).tool;
  const range = marketplaceRangeBySlug(slug);
  if (range) {
    return <ServerMarketplace key={range.slug} range={range} searchParams={searchParams} />;
  }
  const directory = directoryBySlug(slug);
  if (directory) {
    await connection();
    return <DirectoryPage directory={directory} />;
  }
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolsShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(
              breadcrumbSchema([
                ["Home", "/"],
                ["Free tools", "/seo-tools/"],
                [tool.title, `/${tool.slug}/`],
              ]),
              webApplicationNode(tool),
            ),
          ),
        }}
      />
      <ToolHero tool={tool} />
      <ToolWorkspace tool={tool} />
      <ToolSteps tool={tool} />
      <ToolsNext />
      <DirectoryLinks />
    </ToolsShell>
  );
}

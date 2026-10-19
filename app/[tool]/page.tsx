import { pageMetadata } from "@/lib/seo/page-metadata";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { seoDirectoryData, seoDirectoryMetadata } from "@/lib/commerce/seo-catalogue";
import { hasSeoDirectoryContent } from "@/components/site/directory-insights";
import { directoryIndexable } from "@/lib/commerce/catalogue-statistics";
import { facetMetadata } from "@/lib/seo/facets";
import { rangeCopy } from "@/lib/site/range-copy";
import { publicProductPage } from "@/lib/commerce/public-page";
import {
  marketplaceQuery,
  searchQuery,
} from "@/lib/commerce/marketplace-query";
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
import { ReadinessGuide } from "@/components/tools/readiness-guide";
import { tools, toolBySlug } from "@/lib/tools/catalog";
import { directories, directoryBySlug } from "@/lib/site/directories";
import {
  DirectoryLinks,
  DirectoryPage,
} from "@/components/site/directory-page";
import {
  toolBreadcrumbs,
  jsonLdGraph,
  serializeJsonLd,
  webApplicationNode,
} from "@/lib/seo/structured-data";
export function generateStaticParams() {
  return [
    ...marketplaceRanges.map((range) => ({ tool: range.slug })),
    ...directories.map((directory) => ({ tool: directory.slug })),
    ...tools
      .filter(
        (tool) =>
          !["word-counter", "domain-length-checker"].includes(tool.slug),
      )
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
    const [data, stats, catalogue] = await Promise.all([
      publicProductPage(
        marketplaceQuery(searchQuery(search), range).toString(),
      ),
      catalogueSummary(new URLSearchParams(range.bounds).toString()).catch(
        () => null,
      ),
      catalogueSummary("").catch(() => null),
    ]);
    const copy = rangeCopy(range, stats, catalogue);
    if (data.page > 1 && data.data.length === 0) notFound();
    return pageMetadata(
      {
        ...facetMetadata(`/${range.slug}/`, search, data.data.length > 0),
        ...(!copy.indexable ? { robots: { index: false, follow: true } } : {}),
        title:
          `${range.label} Guest Post Sites: Prices & Metrics` +
          (data.page > 1 ? ` — Page ${data.page}` : ""),
        description:
          copy.description + (data.page > 1 ? ` Page ${data.page}.` : ""),
      },
      `/${range.slug}/`,
    );
  }
  const directory = directoryBySlug(slug);
  if (directory) {
    await connection();
    const content = hasSeoDirectoryContent(directory) ? await seoDirectoryData(directory).catch(() => null) : null;
    const stats = hasSeoDirectoryContent(directory) ? (content ? { total: content.summary.count } : null) : await catalogueSummary("", directory.slug).catch(() => null);
    return pageMetadata(
      {
        ...facetMetadata(`/${directory.slug}/`, await searchParams),
        ...(!stats || stats.total < (directory.minIndexableListings ?? 15)
          ? { robots: { index: false, follow: true } }
          : {}),
        ...(hasSeoDirectoryContent(directory) ? seoDirectoryMetadata(directory, content) : { title: directory.metaTitle, description: directory.metaDescription }),
      },
      `/${directory.slug}/`,
    );
  }
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  return pageMetadata(
    {
      ...facetMetadata(`/${tool.slug}/`, await searchParams),
      title: `${tool.title} – Free Online Tool`,
      description:
        tool.slug === "aeo-geo-seo-checker"
          ? "Free SEO, AEO and GEO checker. Audit a page URL or HTML with 14 transparent checks, separate scores, practical recommendations and a downloadable report."
          : `${tool.description} A free Name Retailer tool for SEO, content and link-building teams planning guest-post campaigns.`,
    },
    `/${tool.slug}/`,
  );
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
    return (
      <ServerMarketplace
        key={range.slug}
        range={range}
        searchParams={searchParams}
      />
    );
  }
  const directory = directoryBySlug(slug);
  if (directory) {
    await connection();
    const search = await searchParams;
    return <DirectoryPage directory={directory} subtopic={typeof search.subtopic === "string" ? search.subtopic : undefined} />;
  }
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolsShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(toolBreadcrumbs(tool), webApplicationNode(tool)),
          ),
        }}
      />
      <ToolHero tool={tool} />
      <ToolWorkspace tool={tool} />
      {tool.slug === "aeo-geo-seo-checker" && <ReadinessGuide />}
      <ToolSteps tool={tool} />
      <ToolsNext />
      <DirectoryLinks />
    </ToolsShell>
  );
}

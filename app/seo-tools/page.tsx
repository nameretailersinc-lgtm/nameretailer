import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { DirectoryHero, ToolsShell } from "@/components/tools/presentation";
import { ToolDirectory } from "@/components/tools/directory";
const baseMetadata: Metadata = {
  title: "Free SEO Tools for Guest Posts and Link Building",
  description:
    "Free writing, image, conversion, markup and SEO research tools with clear capabilities and privacy.",
  alternates: { canonical: "https://nameretailer.com/seo-tools/" },
};
export default function Page() {
  return (
    <ToolsShell>
      <DirectoryHero />
      <ToolDirectory />
    </ToolsShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/seo-tools/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: {
        ...(facets.robots as object),
        ...(baseMetadata.robots as object),
      },
    },
    "/seo-tools/",
  );
}

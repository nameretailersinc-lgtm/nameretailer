import { ArticleLibrary } from "@/components/site/article-library";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
export const metadata = {
  title: "Guest Post, SEO and Link Building Guides",
  description:
    "Explore Name Retailer’s complete guide library: SEO, AEO, GEO, content, marketplace and measurement articles with search and topic filters.",
  alternates: { canonical: "https://nameretailer.com/guides/" },
};
export const dynamic = "force-dynamic";
export default function Page({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  return <ArticleLibrary path="/guides/" searchParams={searchParams} />;
}

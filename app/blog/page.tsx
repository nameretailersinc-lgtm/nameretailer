import { ArticleLibrary } from "@/components/site/article-library";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
export const metadata = {
  title: "Name Retailer Blog: SEO, AEO and GEO Guides",
  description:
    "Practical guides to publication planning, content, SEO, AEO, GEO and measurement. Clear answers, useful examples and honest evidence.",
  alternates: { canonical: "https://nameretailer.com/blog/" },
};
export const dynamic = "force-dynamic";
export default function Page({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  return <ArticleLibrary path="/blog/" searchParams={searchParams} />;
}

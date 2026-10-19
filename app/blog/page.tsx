import { ArticleLibrary } from "@/components/site/article-library";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
import { indexMetadata } from "@/lib/blog/index-metadata";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  return indexMetadata(
    "/blog/",
    "Guest Posting Guides and Publisher Research | Name Retailer",
    "Practical guest posting articles on publisher selection, placement budgets, editorial briefs and referral measurement. Use checklists and templates for your campaign.",
    await searchParams,
  );
}
export default function Page({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  return <ArticleLibrary path="/blog/" searchParams={searchParams} />;
}

import { notFound } from "next/navigation";
import { ArticleLibrary } from "@/components/site/article-library";
import { findBlogCategory } from "@/lib/blog/categories";
import { indexMetadata } from "@/lib/blog/index-metadata";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
export const dynamic = "force-dynamic";
type Props = {params: Promise<{slug: string}>; searchParams: Promise<ArticleSearchParams>};
export async function generateMetadata({params, searchParams}: Props) {
  const slug = (await params).slug;
  const category = await findBlogCategory(slug);
  if (!category) notFound();
  return indexMetadata(`/blog/category/${slug}/`, `${category.title} Articles | Name Retailer`, `Browse ${category.title} articles in the Name Retailer journal, with practical questions, sources and reading links.`, await searchParams, category.id);
}
export default async function Page({params, searchParams}: Props) {
  const slug = (await params).slug;
  const category = await findBlogCategory(slug);
  if (!category) notFound();
  return <ArticleLibrary path={`/blog/category/${slug}/`} categoryTitle={category.title} searchParams={Promise.resolve({...await searchParams, category: category.id})} />;
}

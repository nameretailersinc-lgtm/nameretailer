import { ArticleLibrary } from "@/components/site/article-library";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
import { indexMetadata } from "@/lib/blog/index-metadata";
export const dynamic = "force-dynamic";
export async function generateMetadata({searchParams}: {searchParams: Promise<ArticleSearchParams>}) {return indexMetadata("/blog/","SEO, AEO and GEO Blog | Name Retailer","Practical articles on publication planning, content, SEO, AEO, GEO and measurement.",await searchParams);}
export default function Page({searchParams}: {searchParams: Promise<ArticleSearchParams>}) {return <ArticleLibrary path="/blog/" searchParams={searchParams} />;}

import { ArticleLibrary } from "@/components/site/article-library";
import type { ArticleSearchParams } from "@/lib/blog/index-options";
import { indexMetadata } from "@/lib/blog/index-metadata";
export const dynamic = "force-dynamic";
export async function generateMetadata({searchParams}: {searchParams: Promise<ArticleSearchParams>}) {return indexMetadata("/guides/","Guest Post and SEO Guides | Name Retailer","Browse buyer checklists and practical guides to guest posts, metrics, content and measurement.",await searchParams);}
export default function Page({searchParams}: {searchParams: Promise<ArticleSearchParams>}) {return <ArticleLibrary path="/guides/" searchParams={searchParams} />;}

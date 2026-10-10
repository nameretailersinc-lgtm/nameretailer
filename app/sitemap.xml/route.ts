import {sitemapFiles,sitemapIndexXml} from '@/lib/seo/sitemap-files';
export async function GET() { try { return new Response(sitemapIndexXml(await sitemapFiles()),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}}); } catch { return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Retry-After':'60'}}); } }

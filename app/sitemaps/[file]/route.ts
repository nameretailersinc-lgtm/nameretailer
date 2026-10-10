import {sitemapFiles,sitemapHeader,urlEntry} from '@/lib/seo/sitemap-files';
export async function GET(_request:Request,{params}:{params:Promise<{file:string}>}) {
 const {file}=await params;if(!/^(static|hubs|content|publications)-\d+\.xml$/.test(file))return new Response(null,{status:404});
 try {const entries=(await sitemapFiles())[file];if(!entries)return new Response(null,{status:404});return new Response(`${sitemapHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(urlEntry).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});}catch {return new Response(null,{status:503,headers:{'Retry-After':'60'}});}
}

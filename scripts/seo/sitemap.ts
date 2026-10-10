import {pageHtml} from './server';
export async function sitemapUrlset(base:string,path='/sitemap.xml',seen=new Set<string>()):Promise<string> {
 if(seen.has(path))throw new Error('Repeated sitemap part');seen.add(path);
 const xml=await pageHtml(base,path);if(!xml.includes('<sitemapindex'))return xml;
 const parts:string[]=[];for(const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) { const url=new URL(m[1].replaceAll('&amp;','&'));if(url.origin!=='https://nameretailer.com' && url.origin!==new URL(base).origin)throw new Error('Unexpected sitemap host');parts.push(await sitemapUrlset(base,url.pathname,seen)); }return parts.join('\n');
}

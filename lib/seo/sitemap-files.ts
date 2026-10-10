import { cachedAsync } from '../cache/ttl';
import { allSitemapEntries } from './sitemap-entries';
import { canonicalOrigin } from './origin';
import type { MetadataRoute } from 'next';
export const escapeXml = (value:string) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const date=(value:Date|string|undefined) => { const d=value ? new Date(value) : null; return d && Number.isFinite(d.getTime()) ? d.toISOString() : undefined; };
export function urlEntry(entry:MetadataRoute.Sitemap[number]) { const updated=date(entry.lastModified); return `<url><loc>${escapeXml(entry.url)}</loc>${updated ? `<lastmod>${updated}</lastmod>` : ''}</url>`; }
export function splitSitemap(entries:MetadataRoute.Sitemap, maxUrls=20000, maxBytes=45*1024*1024) {
  const chunks:MetadataRoute.Sitemap[]=[]; let rows:MetadataRoute.Sitemap=[],bytes=200;
  for(const entry of entries) { const size=Buffer.byteLength(urlEntry(entry)); if(rows.length && (rows.length>=maxUrls || bytes+size>maxBytes)) { chunks.push(rows);rows=[];bytes=200; } if(size+200>maxBytes)throw new Error('Sitemap URL exceeds size limit');rows.push(entry);bytes+=size; }
  if(rows.length)chunks.push(rows);return chunks;
}
export const sitemapFiles = () => cachedAsync('sitemap-files',{ttlMs:15*60_000,staleOnErrorMs:0,timeoutMs:18000},async () => {
  const groups:Record<string,MetadataRoute.Sitemap>={static:[],hubs:[],content:[],publications:[]};
  const entries=await allSitemapEntries();const seen=new Set<string>();
  for(const e of entries) { if(seen.has(e.url))continue;seen.add(e.url);const p=new URL(e.url).pathname;const group=p.startsWith('/publication/') ? 'publications' : p.startsWith('/guides/') || p.startsWith('/blog/') ? 'content' : /(?:^\/da-|^\/dr-|^\/traffic-|^\/price-|guest-posting-sites|500k-plus-traffic)/.test(p) ? 'hubs' : 'static';groups[group].push(e); }
  return Object.fromEntries(Object.entries(groups).flatMap(([group,rows])=>splitSitemap(rows).map((part,i)=>[`${group}-${i}.xml`,part])));
});
export const sitemapHeader='<?xml version="1.0" encoding="UTF-8"?>';
export function sitemapIndexXml(files:Record<string,MetadataRoute.Sitemap>) { return `${sitemapHeader}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.entries(files).map(([file,entries]) => {const dates=entries.map(e=>date(e.lastModified)).filter((v):v is string=>!!v).sort();return `<sitemap><loc>${canonicalOrigin}/sitemaps/${file}</loc>${dates.length ? `<lastmod>${dates.at(-1)}</lastmod>` : ''}</sitemap>`;}).join('')}</sitemapindex>`; }

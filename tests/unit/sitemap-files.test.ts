import {expect,it,vi} from 'vitest';
vi.mock('@/lib/seo/sitemap-entries',()=>({allSitemapEntries:vi.fn()}));
import {splitSitemap,urlEntry,sitemapIndexXml} from '@/lib/seo/sitemap-files';
it('splits by both URL count and encoded bytes',()=>{const rows=Array.from({length:7},(_,i)=>({url:`https://nameretailer.com/path-${i}/`}));expect(splitSitemap(rows,3).map(p=>p.length)).toEqual([3,3,1]);expect(splitSitemap(rows,50000,350).every(p=>p.reduce((n,e)=>n+Buffer.byteLength(urlEntry(e)),200)<=350)).toBe(true);});
it('escapes XML and omits fabricated lastmod',()=>{expect(urlEntry({url:'https://nameretailer.com/?a=1&b=2'})).toContain('&amp;');expect(sitemapIndexXml({'static-0.xml':[{url:'https://nameretailer.com/'}]})).not.toContain('lastmod');});

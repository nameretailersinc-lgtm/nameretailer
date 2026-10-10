import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {marketplaceGroups} from '@/lib/commerce/marketplace-ranges';
import {legacyRedirects} from '@/lib/seo/redirect-map';
import {directories} from '@/lib/site/directories';
describe('canonical catalogue architecture', () => {
  it('partitions each metric or price group without overlapping boundaries', () => {
    for(const group of marketplaceGroups) for(let i=1;i<group.ranges.length;i++) {
      const prior=group.ranges[i-1].bounds, next=group.ranges[i].bounds;
      const max=Object.keys(prior).find(k=>k.startsWith('max'))!;
      const min=max.replace('max','min');
      expect(Number(next[min])).toBeGreaterThan(Number(prior[max]));
    }
  });
  it('has one budget directory and direct destinations', () => {
    expect(directories.some(d=>d.slug==='guest-posting-sites-under-50')).toBe(true);
    const sources=new Set(legacyRedirects.map(r=>r.source));
    for(const r of legacyRedirects)expect(sources.has(r.destination),r.source).toBe(false);
    expect(legacyRedirects.find(r=>r.source==='/price-0-to-50/')?.destination).toBe('/guest-posting-sites-under-50/');
  });
  it('keeps the reviewable manifest synchronized with the actual 301 configuration', () => {
    expect(JSON.parse(readFileSync('redirects.config','utf8'))).toEqual(legacyRedirects.map(r=>({...r,statusCode:301})));
  });
});

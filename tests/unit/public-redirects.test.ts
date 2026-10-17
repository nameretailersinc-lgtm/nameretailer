import {expect,it} from 'vitest';
import {mergePublicRedirects,publicRedirects} from '@/lib/seo/public-redirects';
it('flattens absolute same-site URLs at every hop', () => {
  const rows = mergePublicRedirects([], [
    {source:'/first/',destination:'/second/',statusCode:301},
    {source:'/second/',destination:'https://nameretailer.com/third/',statusCode:301},
    {source:'/third/',destination:'/final/',statusCode:301},
  ]);
  expect(rows.every(row => row.destination === '/final/')).toBe(true);
});
it('rejects cycles hidden behind absolute same-site URLs', () => {
  expect(() => mergePublicRedirects([], [
    {source:'/first/',destination:'/second/',statusCode:301},
    {source:'/second/',destination:'https://nameretailer.com/first/',statusCode:301},
  ])).toThrow('cycle');
});
it('protects canonical pages when the primary destination is absolute', () => {
  expect(mergePublicRedirects(
    [{source:'/old/',destination:'https://nameretailer.com/final/',statusCode:301}],
    [{source:'/final/',destination:'/old/',statusCode:301}],
  )).toEqual([{source:'/old/',destination:'/final/',statusCode:301}]);
});
it('protects the canonical budget page from an inverse CSV redirect',()=>{const rows=mergePublicRedirects([{source:'/price-0-to-50/',destination:'/guest-posting-sites-under-50/',statusCode:301}],[{source:'/guest-posting-sites-under-50/',destination:'/price-0-to-50/',statusCode:301}]);expect(rows).toEqual([{source:'/price-0-to-50/',destination:'/guest-posting-sites-under-50/',statusCode:301}]);});
it('resolves CSV aliases directly and rejects unrelated cycles',()=>{expect(mergePublicRedirects([{source:'/old/',destination:'/final/',statusCode:301}],[{source:'/csv/',destination:'/old/',statusCode:301}]).find(row=>row.source==='/csv/')?.destination).toBe('/final/');expect(()=>mergePublicRedirects([],[{source:'/a/',destination:'/b/',statusCode:301},{source:'/b/',destination:'/a/',statusCode:301}])).toThrow('cycle');});
it('has no redirect source among the final configured destinations',()=>{const rows=publicRedirects();const sources=new Set(rows.map(row=>row.source));for(const row of rows)expect(sources.has(row.destination),row.source).toBe(false);expect(sources.has('/guest-posting-sites-under-50/')).toBe(false);});

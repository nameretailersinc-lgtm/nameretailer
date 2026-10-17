import { mkdir, writeFile } from 'node:fs/promises';

// Read-only audit of the canonical public site. It does not submit URLs to Google.
const origin = 'https://nameretailer.com';
const urls = new Set();
const sitemaps = [];
const visited = new Set();
async function read(url) {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  return { response, body: await response.text() };
}
async function sitemap(url) {
  if (visited.has(url)) return;
  if (new URL(url).origin !== origin || visited.size >= 50) throw new Error('Unexpected sitemap scope');
  visited.add(url);
  const { response, body } = await read(url);
  if (response.status !== 200 || !/xml/i.test(response.headers.get('content-type') || '')) throw new Error(`Sitemap failed: ${url} (${response.status})`);
  const locations = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
  sitemaps.push({ url, status: response.status, locations: locations.length });
  if (body.includes('<sitemapindex')) for (const location of locations) await sitemap(location);
  else if (body.includes('<urlset')) for (const location of locations) {
    if (new URL(location).origin !== origin) throw new Error('Off-site sitemap URL');
    urls.add(location);
  }
  else throw new Error('Invalid sitemap document');
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
}
await sitemap(`${origin}/sitemap.xml`);
if (urls.size > 1000) throw new Error('More than 1,000 URLs; explicitly scope a larger crawl');
const rows = [];
const pending = [...urls];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (pending.length) {
    const url = pending.shift();
    try {
      const { response, body } = await read(url);
      const tags = [...body.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m => attributes(m[0]));
      const robots = tags.filter(t => /^(robots|googlebot)$/i.test(t.name || '')).map(t => t.content || '').join(',');
      const headerRobots = response.headers.get('x-robots-tag') || '';
      const canonical = tags.find(t => t.rel?.toLowerCase() === 'canonical')?.href || '';
      const issues = [];
      if (response.status !== 200) issues.push(`HTTP ${response.status}`);
      if (!/text\/html/i.test(response.headers.get('content-type') || '')) issues.push('not HTML');
      if (/\b(noindex|none)\b/i.test(`${robots},${headerRobots}`)) issues.push('noindex');
      if (canonical !== url) issues.push(canonical ? 'different canonical' : 'missing canonical');
      rows.push({ url, status: response.status, location: response.headers.get('location'), canonical, robots, headerRobots, issues });
    } catch (error) {
      rows.push({ url, issues: [`request failed: ${error.name}`] });
    }
    if (rows.length % 25 === 0) console.log(`Checked ${rows.length}/${urls.size}`);
  }
}));
rows.sort((a, b) => a.url.localeCompare(b.url));
const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Live sitemap URLs only; not a Google index count or a complete URL inventory. Robots.txt crawl matching, rendered content quality and Google-selected canonicals need separate checks.',
  sitemaps,
  total: rows.length,
  passedHttpRobotsCanonical: rows.filter(r => !r.issues.length).length,
  withIssues: rows.filter(r => r.issues.length).length,
  rows,
};
await mkdir('reports', { recursive: true });
await writeFile('reports/live-indexability.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ total: report.total, passedHttpRobotsCanonical: report.passedHttpRobotsCanonical, withIssues: report.withIssues }));
if (report.withIssues) process.exitCode = 1;

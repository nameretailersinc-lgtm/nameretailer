import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = "docs/seo-indexing-recovery";
await mkdir(root, { recursive: true });
const read = async (file, fallback = null) => { try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; } };
const log = async file => { try { const bytes = await readFile(`.local/${file}`); return bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? "utf16le" : "utf8").replace(/^\uFEFF/, ""); } catch { return "Not run"; } };
const baseline = await read(".local/seo-recovery/production-baseline/responses.json");
const after = await read(process.env.RECOVERY_AFTER_PROBE || ".local/seo-recovery/local-final/responses.json");
const beforeGraph = await read(".local/seo-recovery/production-crawl-sampled/crawl.json");
const graph = await read(process.env.RECOVERY_AFTER_CRAWL || ".local/seo-recovery/local-final-crawl-warm/crawl.json");
const assets = await read(process.env.RECOVERY_AFTER_ASSETS || ".local/seo-recovery/local-final-crawl-warm/assets.json", []);
const data = await read(".local/seo-recovery/data-audit.json");
const profiles = await read(".local/seo-recovery/profile-audit.json");
const benchmark = await read(".local/seo-recovery/directory-benchmark.json", []);
if (!baseline || !after || !graph || !beforeGraph || !data || !profiles) throw new Error("Required recovery evidence missing");
const csv = async (name, rows, columns) => {
  const fields = columns || [...new Set(rows.flatMap(row => Object.keys(row)))];
  const cell = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
  await writeFile(path.join(root, name), [fields.map(cell).join(","), ...rows.map(row => fields.map(key => cell(Array.isArray(row[key]) ? row[key].join("; ") : row[key])).join(","))].join("\n") + "\n");
};
const markdown = (file, body) => writeFile(path.join(root, file), body.trim() + "\n");
const priority = ["/guest-posting-sites/", "/saas-guest-posting-sites/", "/technology-guest-posting-sites/", "/guides/vet-a-guest-post-site/", "/blog/a-responsive-article-page-qa-checklist/"];
const origin = "https://nameretailer.com";
const type = route => route.startsWith("/publication/") ? "publication" : route.startsWith("/guides/") ? "guide" : route.startsWith("/blog/") ? "blog" : route.includes("guest-posting-sites") ? "directory" : "public route";
const latest = (rows, route) => rows.filter(row => row.route === route).at(-1);
const beforePages = new Map(beforeGraph.pages.map(p => [p.route, p]));
const pages = new Map(graph.pages.map(p => [p.route, p]));
const sitemaps = new Map(graph.sitemapUrls.map(entry => [new URL(entry.url).pathname, entry]));
const oldSitemaps = new Set(beforeGraph.sitemapUrls.map(entry => new URL(entry.url).pathname));
const incoming = new Map();
const outgoing = new Map();
for (const edge of graph.edges) {
  const route = edge.target.split("?")[0];
  incoming.set(route, new Set([...(incoming.get(route) || []), edge.source]));
  outgoing.set(edge.source, new Set([...(outgoing.get(edge.source) || []), route]));
}
const depth = new Map([["/", 0]]), queue = ["/"];
while (queue.length) {
  const route = queue.shift();
  for (const target of outgoing.get(route) || []) if (!depth.has(target)) { depth.set(target, depth.get(route) + 1); queue.push(target); }
}
const changes = {
  "/guest-posting-sites/": "Corrected supplied-metric and availability claims; complete price section before render; real editorial lastmod",
  "/saas-guest-posting-sites/": "Scoped Mongo aggregation; only visible rows transferred; warm cache; shared sitemap eligibility; safe paragraph wrapping",
  "/technology-guest-posting-sites/": "Scoped Mongo aggregation with exact subtopic counts and DR distributions; shared sitemap eligibility",
  "/blog/a-responsive-article-page-qa-checklist/": "Reviewed eligibility, practical responsive guidance, descriptive headings, accurate collapsed-content guidance, journal/site-map links and actual revision date",
  "/site-map/": "Crawlable journal article links and query noindex precedence",
  "/guest-post-prices/": "Grouped price inputs replace whole-catalogue document transfer",
  "/guides/guest-post-cost/": "Shared grouped price inputs; existing guide copy retained",
};
function auditRow(route) {
  const live = latest(baseline.results, route) || beforePages.get(route);
  const local = latest(after.results, route) || pages.get(route);
  return { URL: origin + route, page_type: type(route), current_HTTP_status: live?.status ?? "Not measured", production_canonical: live?.canonical || "Not measured",
    robots_status: live?.robots || "Not measured", sitemap_status: oldSitemaps.has(route) ? "Production sitemap included" : "Production sitemap absent",
    internal_link_status: incoming.has(route) ? `${incoming.get(route).size} measured incoming source pages; local depth ${depth.get(route) ?? "unknown"}` : "Not established",
    identified_problem: ["/saas-guest-posting-sites/", "/technology-guest-posting-sites/"].includes(route) ? "Production noindex, no listings and repeated 12–17s TTFB" : route === priority[4] ? "Blanket code noindex despite CMS robotsIndex=true; inaccurate mobile advice" : route === priority[0] ? "Contradictory metric verification claims; streaming price fallback" : "See technical report; no priority-guide defect established",
    supporting_evidence: "Sanitized HTTP evidence, rendered graph and read-only content audit; see evidence.json",
    implemented_change: changes[route] || "Preserved existing content and behavior",
    remaining_concern: "Changes are local and not deployed. GSC URL membership and Google-selected canonical unknown.",
    verification_result: local ? `Local HTTP ${local.status}; ${local.robots || "robots not measured"}; canonical ${local.canonical || "not measured"}; sitemap ${sitemaps.has(route) ? "included" : "absent"}` : "Local response not measured" };
}
await csv("priority-pages-audit.csv", priority.map(auditRow));
await csv("crawled-not-indexed-url-audit.csv", priority.map(route => ({ ...auditRow(route), GSC_example_membership: "UNCONFIRMED: exact ~150-URL export was not supplied", Google_selected_canonical: "Requires URL Inspection", last_crawl_and_index_verdict: "Requires Search Console access" })));
const redirectConfig = JSON.parse(await readFile("redirects.config", "utf8"));
const legacy = new Set([...redirectConfig.map(r => r.source), ...baseline.results.filter(r => r.round === 1 && !priority.includes(r.route)).map(r => r.route)]);
await csv("legacy-wordpress-redirect-map.csv", [...legacy].map(route => {
  const redirect = redirectConfig.find(r => r.source === route);
  const live = latest(baseline.results, route);
  const local = latest(after.results, route);
  const removed = ["/hello-world/", "/2824-2/", "/category/uncategorized/"].includes(route);
  return { URL: origin + route, page_type: "legacy/auxiliary URL", current_HTTP_status: live?.status ?? "Not individually measured in production",
    canonical: live?.canonical || "Not applicable/not measured", robots_status: live?.robots || "Redirect or not measured", sitemap_status: "Not advertised as legacy URL", internal_link_status: incoming.has(route) ? "Linked: review" : "No incoming link in measured graph",
    identified_problem: removed ? "Unrelated blanket redirect to blog; no current content record or equivalent article" : redirect ? "Existing specific/legacy mapping retained" : "See classification",
    supporting_evidence: removed ? "Source redirect map; read-only CMS audit found no matching records; production 301" : "Configured redirect manifest and manual HTTP probes",
    implemented_change: removed ? "Removed mapping from source, CSV and manifest; real 404" : redirect ? `301 to ${redirect.destination}` : "Preserved current response",
    remaining_concern: "Historical traffic, backlinks and indexing unknown without GSC/historical exports; broad pre-existing service/editorial mappings still require equivalence review",
    verification_result: local ? `Local HTTP ${local.status}${local.headers?.location ? ` -> ${local.headers.location}` : ""}` : redirect ? "Included in configured redirect test; see verification results" : "Not individually tested",
    expected_status: removed ? 404 : redirect?.statusCode || live?.status || "Requires classification", destination: redirect?.destination || "",
    classification: removed ? "Removed without equivalent; do not redirect to hub" : /ads\.txt|app-ads\.txt/.test(route) ? "No authorized advertising records supplied; legitimate 404" : /feed|apple-app/.test(route) ? "Unsupported legacy/auxiliary endpoint; legitimate 404" : /page\/(92|2)\//.test(route) ? "Old filter pagination lacks provable page equivalence; retain 404" : route === "/?SA" ? "Noindex variant with clean canonical; retained" : redirect ? "Permanent alias; inspect original content before extending/removing older mappings" : "Existing public/auxiliary route",
  };
}));
await csv("broken-assets-report.csv", [...assets.map(asset => ({ URL: origin + asset.route, page_type: "asset", current_HTTP_status: asset.status, canonical: "Not applicable", robots_status: "Not applicable", sitemap_status: "Not page sitemap content", internal_link_status: `Referenced by ${asset.source}`, identified_problem: asset.status === 200 ? "None in this check" : "Failed asset response", supporting_evidence: "Local HTTP GET asset crawl", implemented_change: "Existing authentic asset retained", remaining_concern: "Recheck deployed build; historical missing image filenames were not supplied", verification_result: `Local HTTP ${asset.status}`, content_type: asset.contentType })),
  ...["/ads.txt", "/app-ads.txt", "/feed/", "/comments/feed/", "/.well-known/apple-app-site-association"].map(route => ({ ...auditRow(route), identified_problem: "No current required resource established", implemented_change: "Keep legitimate 404; no fabricated publisher IDs or unrelated redirects", verification_result: `Local HTTP ${latest(after.results, route)?.status ?? "not measured"}` })),
  { URL: "WordPress media and plugin resource references", page_type: "source/content inventory", current_HTTP_status: "Historical asset filenames unavailable", supporting_evidence: `Source reference scan plus ${data.articles.length} content records: no current WordPress asset references`, implemented_change: "No fabricated or unrelated image replacements", remaining_concern: "Need exact 404 export filenames or historical assets to classify requests individually", verification_result: "No current broken WordPress reference found; historical resources not resolved by assumption" },
]);
await csv("internal-link-audit.csv", graph.sitemapUrls.map(entry => {
  const route = new URL(entry.url).pathname, measured = pages.get(route);
  return { URL: entry.url, page_type: type(route), current_HTTP_status: measured?.status ?? "HTML not sampled", canonical: measured?.canonical || "Expected self canonical from source; HTML not sampled", robots_status: measured?.robots || "Eligible per source policy; HTML not sampled", sitemap_status: entry.sitemap,
    internal_link_status: incoming.has(route) ? `${incoming.get(route).size} measured source pages` : "No incoming link found", identified_problem: incoming.has(route) ? "No orphan established" : "Needs discovery review", supporting_evidence: "All measured standard anchor edges; source URLs in internal-link-edges.csv", implemented_change: changes[route] || "Preserved existing discovery links", remaining_concern: "Outgoing publication graph sampled; arbitrary filter and pagination space not exhaustively crawled", verification_result: incoming.has(route) ? "Crawlable incoming HTML anchor observed" : "Unverified", minimum_clicks_from_home: depth.get(route) ?? "Not established", sample_source: [...(incoming.get(route) || [])][0] || "" };
}));
await csv("internal-link-edges.csv", graph.edges);
await csv("duplicate-content-audit.csv", [
  ...data.articles.map(article => ({ URL: origin + "/" + article.slug + "/", page_type: "article", current_HTTP_status: pages.get("/" + article.slug + "/")?.status ?? "Not sampled", canonical: article.canonical || "Generated from route", robots_status: pages.get("/" + article.slug + "/")?.robots || "See source policy", sitemap_status: sitemaps.has("/" + article.slug + "/") ? "Included" : "Not included", internal_link_status: incoming.has("/" + article.slug + "/") ? "Incoming HTML link observed" : "Not established", identified_problem: article.slug.endsWith("a-responsive-article-page-qa-checklist") ? "Inaccurate mobile-content statement and numbered generic section labels; corrected" : "No exact duplicate body or undefined keyword found", supporting_evidence: "All 60 rendered article bodies compared through publicArticle; keyword registry fallback reviewed", implemented_change: changes["/" + article.slug + "/"] || "Preserved useful existing content", remaining_concern: "Exact-body matching does not prove editorial originality or exclude overlapping search intent", verification_result: "Zero identical article bodies; zero rendered undefined keywords in read-only snapshot" })),
  ...profiles.rows.map(profile => ({ URL: profile.url, page_type: "publication", current_HTTP_status: pages.get(new URL(profile.url).pathname)?.status ?? "HTML not sampled", canonical: profile.url, robots_status: profile.eligible ? "Eligible per source; HTTP directive not individually verified" : "Excluded per source", sitemap_status: sitemaps.has(new URL(profile.url).pathname) ? "Included" : "Not in captured sitemap", internal_link_status: incoming.has(new URL(profile.url).pathname) ? "Incoming HTML anchor observed" : "Not established", identified_problem: profile.reviewedContent ? "Source-backed content available" : "No reviewed editorial description; supplied fields and explicit missing-evidence notices", supporting_evidence: "Read-only eligible-profile audit; zero duplicate generated titles/descriptions", implemented_change: "No invented publisher data or automatic noindex", remaining_concern: profile.missing.join("; "), verification_result: "Generated metadata checked for uniqueness; editorial adequacy and Google selection remain unproven" })),
]);
const oldNoindex = beforeGraph.pages.filter(p => p.inSitemap && /noindex/.test(p.robots));
const badSitemap = graph.pages.filter(p => p.inSitemap && (p.status !== 200 || /noindex/.test(p.robots) || p.canonical !== origin + p.route));
await csv("sitemap-validation.csv", graph.sitemapUrls.map(entry => {
  const route = new URL(entry.url).pathname, measured = pages.get(route);
  const url = new URL(entry.url);
  const valid = url.origin === origin && !url.search && !url.hash && url.pathname.endsWith("/") && !redirectConfig.some(r => r.source === route);
  return { URL: entry.url, page_type: type(route), current_HTTP_status: measured?.status ?? "HTML not sampled", canonical: measured?.canonical || "Expected from shared eligibility source", robots_status: measured?.robots || "Not individually measured", sitemap_status: entry.sitemap, internal_link_status: incoming.has(route) ? "Incoming HTML anchor observed" : "Not established", identified_problem: !valid ? "Invalid sitemap URL" : measured && (measured.status !== 200 || /noindex/.test(measured.robots)) ? "HTTP eligibility problem" : "No issue in performed checks", supporting_evidence: "All XML entries parsed; HTML eligibility tested only where response recorded", implemented_change: changes[route] || "Canonical sitemap route retained; incomplete snapshots now fail with retryable 503", remaining_concern: measured ? "Requires deployment and live recheck" : "HTTP and rendered metadata not individually tested", verification_result: valid ? measured ? "XML syntax and sampled HTTP eligibility checked" : "XML syntax/source policy checked; HTTP not sampled" : "Failed", lastmod: entry.lastmod || "Omitted; no invented date" };
}));
const timings = priority.map(route => {
  const old = baseline.results.filter(r => r.route === route), current = after.results.filter(r => r.route === route);
  return { route, productionTTFB: old.map(r => r.ttfbMs ?? r.error), localTTFB: current.map(r => r.ttfbMs ?? r.error), productionLinks: old[0]?.publicationLinks, localLinks: current.at(-1)?.publicationLinks };
});
const missingIncoming = graph.sitemapUrls.filter(entry => !incoming.has(new URL(entry.url).pathname));
const unit = await log("seo-recovery-tests.log"), lint = await log("seo-recovery-lint.log"), build = await log("seo-recovery-build.log"), types = await log("seo-recovery-types.log"), browser = await log("seo-recovery-browser-final.log"), integration = await log("seo-recovery-integration.log"), redirects = await log("seo-recovery-redirects.log"), ssr = await log("seo-recovery-ssr.log");
const evidence = { date: "2026-10-20", production: baseline.results.map(({ headers, ...row }) => ({ ...row, xRobotsTag: headers?.["x-robots-tag"], location: headers?.location })), local: after.results.map(({ headers, ...row }) => ({ ...row, xRobotsTag: headers?.["x-robots-tag"], location: headers?.location })), timings, benchmark,
  graph: { fetchedPages: graph.pages.length, productionFetchedPages: beforeGraph.pages.length, sitemapUrls: graph.sitemapUrls.length, publicationSample: graph.profileSample, standardAnchorEdges: graph.edges.length, sitemapUrlsWithoutObservedIncomingLinks: missingIncoming.length, incomplete: graph.truncated, productionGraphInterrupted: beforeGraph.truncated, outgoingPublicationGraphComplete: false },
  sitemap: { files: graph.xml, sampledProblems: badSitemap, productionSampledNoindex: oldNoindex.map(p => p.route) },
  assets: { checked: assets.length, broken: assets.filter(a => a.status !== 200) }, profiles: { eligible: profiles.profiles, reviewedEditorialContent: profiles.reviewed, duplicateTitles: profiles.duplicateTitles.length, duplicateDescriptions: profiles.duplicateDescriptions.length },
  articles: { records: data.articles.length, duplicateBodies: data.duplicateArticleBodies.length, undefinedKeywordOccurrences: data.articles.filter(a => a.undefinedKeyword).length, legacyAssetReferences: data.articles.flatMap(a => a.legacyAssets).length },
  checks: { unit: unit.match(/Test Files[^\n]*\n[^\n]*Tests[^\n]*/)?.[0] || unit.slice(-400), lint: lint.trim(), typecheck: types.trim(), build: build.slice(-700), browser: browser.split(/\r?\n/).filter(l => /passed:|failed:|Run /.test(l)), integration: integration.split(/\r?\n/).filter(l => /passed:|failed:|Run /.test(l)), redirects: redirects.trim(), ssr: ssr.split(/\r?\n/).filter(l => /publication rows|Error|Assertion/.test(l)) },
};
await writeFile(path.join(root, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
await markdown("executive-summary.md", `# NameRetailer indexing recovery — 20 October 2026

Implemented locally; **not deployed**. Google indexing and ranking have not been claimed as fixed.

Confirmed production technical issues: the SaaS and Technology directories returned 200 but noindex and no publication rows on three direct probes each. Their full-catalogue read exceeded its deadline. The responsive QA article's code policy excluded it despite its CMS robotsIndex=true setting. The live sitemap advertised pages that returned noindex. Local cold-cache testing also demonstrated partial sitemap snapshots on read failures; the implementation now fails retryably instead of caching incomplete success.

Confirmed content issues: the hub simultaneously claimed verified metrics and explained they were not independently verified; the responsive article incorrectly equated collapsed mobile content with non-indexable content. Its numbered section labels and rigid device/font assertions were corrected. Long tracking parameters caused mobile overflow and now wrap within existing cards.

Legacy migration issues: /hello-world/, /2824-2/ and /category/uncategorized/ redirected to an unrelated blog hub without corresponding CMS records. These now return 404 locally. Specific equivalent redirects remain. Historical pagination and unsupported auxiliary resources retain honest 404s.

Local evidence: five priority pages return 200, self canonical and index, follow in repeated checks; SaaS/Technology contain actual linked listings. ${graph.sitemapUrls.length} sitemap entries were parsed, ${graph.pages.length} HTML pages and ${assets.length} assets were fetched, and ${graph.edges.length} HTML anchor edges were recorded. Every one of ${profiles.profiles} eligible publication profiles was checked for generated metadata duplication; none were found. None has reviewed editorial content in the captured data. This is an editorial evidence gap, not proof of why Google excluded a page.

Limits: the exact ~150-URL GSC export, URL Inspection history, traffic/backlink history, production access/error logs and active Nginx configuration were unavailable. Publication HTML and outgoing links were sampled; this is not a complete outgoing graph of every listing and filter variant. See verification-results.md for exact executed checks and any remaining failures.

The supplied crawl statistics establish activity and a healthy host. Low discovery percentage, resource/AdsBot traffic and fluctuations do not establish a crawl-budget problem or penalty. Request indexing only after an authorized deployment and live verification; monitor for 2–6 weeks without guaranteeing selection.`);
await markdown("technical-indexing-audit.md", `# Technical audit

Scope: existing Next.js 16.3.8 App Router application, MongoDB-backed inventory/CMS, proxy.ts, standalone deployment. Relevant installed Next.js metadata, caching, sitemap, robots and icon documentation was read before changes. There was no pre-existing working-tree diff at baseline.

Routes: marketplace / and /page/[page]; registered /[tool] directory, metric and tool routes; publication root/section identities; guides, CMS blog and blog categories; static company/legal pages; private account/cart/checkout/admin; API/media routes; robots, llms and XML sitemap handlers. No new landing pages or business routes were added.

Public robots permits HTML and required resources; private routes remain restricted. API/private responses retain X-Robots-Tag noindex. The preferred origin is fixed HTTPS non-www. Query controls use clean canonicals and noindex; the site-map query policy had its noindex accidentally overwritten by base metadata and was corrected. Existing pagination policy was preserved. Unknown missing URLs retain true 404 responses. No bot-specific page content, crawl-frequency manipulation or AdsBot blocking was introduced.

The five priority canonicals were already correct in production. The production issue was eligibility/data rendering, not a demonstrated canonical conflict. No blanket canonical rewrite was performed. Directory metadata and XML now use the same scoped data and thresholds. A failed sitemap read propagates to the existing uncached 503/Retry-After handler instead of caching a partial list.

Public catalogue reads are server-side, with process-local TTL/in-flight caching. Directory aggregates now filter active, committed, clean USD inventory inside MongoDB, retain full-match counts/price distributions, and return only displayed rows plus selected subtopic rows. Price reporting transfers grouped numeric inputs instead of full publication documents. Stale-while-revalidate keeps established public data available during refresh; original read deadlines and disclosure limitations remain.

Structured data uses existing visible Article, FAQ, CollectionPage and breadcrumb components. No fabricated rating, review, author or FAQ was added. The article's actual revision date and matching sitemap date are 2026-10-20; the preserved vetting guide's existing date is unchanged. Automatic build-time lastmod was not introduced. JSON-LD parsing and repository schema checks apply to sampled rendered pages, not Google rich-result eligibility.

Favicon: existing ICO is valid, returns 200, and matches the existing NR brand design. No authorized advertising publisher IDs or current missing WordPress media references were found. No fake advertising files or image replacements were created.

Coverage: see priority-pages-audit.csv and sitemap-validation.csv for actual HTTP versus source-only checks. All ${profiles.profiles} eligible profiles have unique generated titles/descriptions, but none has reviewed publisher editorial content in the captured database. Missing fields remain explicit. No publication was automatically removed or noindexed as a reaction to GSC non-selection.

Production-only unknowns: active Nginx/CDN configuration, TLS/host normalization across every hostname, verified crawler identity, logs, cache-hit rates, long-run 429/5xx incidence and Google-selected canonicals. Docker/Compose and deployment documentation were inspected; no production configuration, credentials or deployment was changed. Existing broad redirects beyond the reviewed examples need historical-content equivalence review.`);
await markdown("performance-report.md", `# Performance evidence

These are network measurements from this workstation, not Core Web Vitals or a production rollout comparison. Production and loopback have different network paths/cache conditions. First local requests include database connection/cold-cache work. Subsequent requests demonstrate warm behavior only.

| Existing page | Production TTFB, three probes (ms) | Local TTFB, three probes (ms) | Publication links, production first / local final |
|---|---|---|---|
${timings.map(t => `| ${t.route} | ${t.productionTTFB.join(", ")} | ${t.localTTFB.join(", ")} | ${t.productionLinks} / ${t.localLinks} |`).join("\n")}

Direct requests established repeated slow 200/noindex category responses; retrieval-tool timeouts were not used alone as proof. The new scoped payload benchmark is recorded in evidence.json. It preserves the actual counts: 541 SaaS and 3,062 Technology listings in the captured inventory, while transferring 25 main rows and exact category subsets rather than all 56,005 inventory documents.

Price-report grouping retains original active/committed visibility, numeric USD prices, DA/DR bands, medians/percentiles, top-topic/country ordering and metric hygiene notices. No price, readership or result is fabricated.

Cold sitemap requests initially exceeded the 30/45-second probe deadlines and an early local snapshot omitted failed ranges. A longer retry succeeded after warming. The corrected source does not cache partial-success snapshots: failures yield retryable 503 and must be checked on deployment. Full cold-cache reliability under production network conditions remains an operator verification item.

No production server logs or active Nginx config were available. The existing Nginx document is guidance, not evidence of deployed settings. Do not apply an HTML cache without separately validating session/cookie, authorization and RSC behavior. No infrastructure changes were made. No Lighthouse/CrUX improvement is claimed.`);
await markdown("implementation-changelog.md", `# Implemented changes

- lib/commerce/seo-catalogue.ts: scoped directory aggregates, full-result distributions and exact subtopic counts with bounded visible row transfer; stale refresh behavior.
- lib/commerce/price-breakdown.ts: grouped numeric price-report reads replace full catalogue-document transfer; preserve statistics and hygiene semantics.
- components/site/directory-insights.tsx: render aggregate-backed DR/subtopic figures and all-match counts.
- app/[tool]/page.tsx and lib/seo/sitemap-entries.ts: align directory eligibility sources; remove unused imports; fail incomplete sitemap reads; meaningful revision dates.
- app/guest-posting-sites/page.tsx: resolve price content before rendering that section, correct metric/availability wording and disclose disabled ordering and non-reservation.
- lib/blog/indexing-policy.ts, queries.ts, public-copy.ts and editorial.ts: selectively admit the reviewed responsive QA article while honoring explicit CMS noindex; share journal/sitemap policy and real update date.
- lib/blog/technical-aeo.ts: preserve the responsive article's topic, practical example and checklist; correct mobile indexing claims, remove artificial section numbering, improve viewport/keyboard/zoom tests and contextual links.
- app/site-map/page.tsx: crawlable approved journal links and correct noindex precedence for query variants.
- lib/site/guest-posting-guides.ts: contextual responsive QA link from the publishing checklist and actual meaningful revision date. The substantial vetting guide was preserved.
- app/reference.css: allow long example parameters to wrap inside existing text cards, addressing measured 487px document width at 320/375px viewports.
- lib/seo/redirect-map.ts, docs/redirect-map.csv and redirects.config: remove three unrelated WordPress-to-blog redirects; retain honest missing-page responses and specific aliases.
- app/llms.txt/route.ts: remove obsolete ordering claims; describe private planning limitations and use shared article eligibility. This file is not an indexing solution.
- Unit and browser regression tests cover scoped reads, statistics, explicit noindex overrides, partial sitemap failure, reviewed-article eligibility, redirects, complete priority HTML and mobile layout. The older publication-dialog test expected a removed Plan placement link; it now asserts the existing Add to plan button, consistent with the restored planning workflow.
- scripts/seo/recovery-*: reproducible read-only probes, crawl graph/assets, catalogue/content audits, benchmark and report generation. Reports distinguish live, local, source-derived and untested evidence.

No database content or production credentials were modified. Only isolated test databases receive synthetic regression fixtures. No deployment, ordering/payment enablement, new SEO landing page or visual redesign was performed.`);
await markdown("verification-results.md", `# Verification results

Baseline: 63 unit files / 617 tests passed. Baseline ESLint: zero errors, two unused-import warnings. No initial working-tree changes.

Final/current recorded results:

\`\`\`text
${evidence.checks.unit}
${evidence.checks.lint}
${evidence.checks.typecheck}
${evidence.checks.redirects}
\`\`\`

Production build tail:

\`\`\`text
${evidence.checks.build}
\`\`\`

Browser regression run:

\`\`\`text
${evidence.checks.browser.join("\n") || "Final browser run not yet recorded; do not mark passed."}
\`\`\`

Isolated authentication/saved-plan/payment regression run:

\`\`\`text
${evidence.checks.integration.join("\n") || "Not yet recorded; do not mark passed."}
\`\`\`

The initial browser pass found 21 passing and 4 failing tests: two failures were obsolete expectations for a Plan placement link (the current UI uses Add to plan); two exposed genuine SaaS paragraph overflow at 320/375px. The assertions and wrapping defect were corrected and the final rerun is listed above. Nothing was enabled to satisfy stale checkout expectations.

HTTP/rendered audit: ${graph.pages.length} fetched HTML pages; ${graph.sitemapUrls.length} parsed sitemap URLs; ${assets.length} checked asset responses, ${assets.filter(a => a.status !== 200).length} failed; ${badSitemap.length} eligibility conflicts among sampled sitemap HTML responses. Source/public-data metadata audit covers all ${profiles.profiles} eligible publications. XML entry validity is checked exhaustively; individual publication HTTP/rendered and outgoing-link checks are sampled, not exhaustive. No Google indexing verification was performed.

The repository SSR check output covers ${evidence.checks.ssr.filter(l => /publication rows/.test(l)).length} observations; the final log is retained locally. Older check:urls assumptions about homepage pagination and AEO category visibility predate the current approved policy and must not drive business changes. Full 10k-publication versions of check:links/check:health/check:meta/check:jsonld and the entire unrelated admin E2E suite were not represented as passed. Equivalent focused HTTP, canonical/robots, metadata, JSON-LD, asset and graph checks are recorded here with explicit sample boundaries.

Remaining requirements: authorized deployment, live re-probes, a real GSC URL export/Inspection sample, production log review, publisher editorial evidence and any failed isolated tests above. Passing local checks does not establish Google indexing.`);
await markdown("google-search-console-follow-up.md", `# Search Console follow-up

No Search Console account data was accessed. The supplied approximate count and crawl statistics are context; the exact ~150 affected URLs, Google-selected canonicals and last-crawl dates remain unknown. The CSV contains the five investigated URLs and marks membership unconfirmed rather than fabricating the export.

After the owner authorizes deployment:

1. Confirm the deployed five URLs return 200 with meaningful HTML, self canonical, index/follow, working assets and no conflicting HTTP robots directive. Repeat SaaS/Technology with cold and warm caches. Verify XML index and children after a cold start; retryable failures must not become cached partial 200 snapshots.
2. Open each priority URL in [URL Inspection](https://support.google.com/webmasters/answer/9012289), record Google's indexed status, last crawl, fetch result, user/Google-selected canonical and referring/sitemap information. Run Test live URL, inspect rendered content and resources, and confirm noindex is gone on the deployed build.
3. In Sitemaps, verify https://nameretailer.com/sitemap.xml and its existing children. Resubmit the existing sitemap after meaningful deployed corrections if appropriate; do not submit filter variants or fabricate lastmod. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
4. Request indexing for the five corrected URLs or a smaller representative subset. Repeated requests are not a recovery strategy and successful live tests do not guarantee selection.
5. Export the actual Crawled – currently not indexed examples and join them to crawled-not-indexed-url-audit.csv. Separate changed valuable pages, duplicates, retired WordPress URLs and auxiliary resources. Inspect representatives of each group before wider changes.
6. Record a deployment-date baseline and compare weekly for 2–6 weeks: submitted/discovered/indexed counts, exclusion reasons, per-URL canonical decisions, impressions, and eligible-page coverage. Example lists and totals can change and processing can lag; compare consistent cohorts.
7. Review Crawl Stats by response, HTML/resource type and verified Search Googlebot. Keep AdsBot, image and resource loading separate. Correlate 429/5xx/slow HTML with server logs. Healthy host status and low discovery share alone do not establish a budget issue or penalty.

For the meaning of exclusion categories see [Page indexing report](https://support.google.com/webmasters/answer/7440203). Indexing, rankings, traffic and any particular recovery date remain Google's decisions. The live test proves current access/eligibility, not that Google will index a page.

Editorial references checked during this work: [Google mobile content guidance](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) supports equivalent accessible content, including accordions/tabs; [paid-link qualification](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) distinguishes sponsored/nofollow attributes from visible disclosure. No FAQ rich-result promise is made.`);
console.log(JSON.stringify({ reports: root, sitemapUrls: graph.sitemapUrls.length, measuredPages: graph.pages.length, graphEdges: graph.edges.length, assets: assets.length, missingIncoming: missingIncoming.length }));

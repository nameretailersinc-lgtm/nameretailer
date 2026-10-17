"""Build a traceable per-URL keyword inventory from the read-only crawl evidence."""
import csv
import json
from pathlib import Path
from urllib.parse import urlsplit

origin = "https://nameretailer.com"
# Editorial targets, not measured search volumes or ranking observations.
targets = {
    "/": ("guest post marketplace for SEO agencies", "buy guest posts from relevant websites; guest posting marketplace for small businesses", "guest posting sites with prices; guest post marketplace with niche filters", "commercial", "P1"),
    "/guest-posting-sites/": ("guest posting sites", "guest posting opportunities by industry", "guest posting sites with organic traffic; English-language guest posting websites", "directory navigation", "P1"),
    "/guest-post-marketplace/": ("compare guest post marketplace filters", "DA DR traffic and price filters", "how to compare guest posting marketplace metrics", "product navigation", "P2"),
    "/guest-post-by-dr/": ("guest post sites by Domain Rating", "guest posting sites with DR filters", "compare guest post publishers by supplied Domain Rating", "commercial comparison", "P2"),
    "/guest-post-prices/": ("guest post pricing by niche", "guest post prices; marketplace price data", "compare guest post placement prices by niche", "commercial research", "P1"),
    "/guides/guest-post-cost/": ("how much does a guest post cost", "guest post cost; guest post pricing factors", "how to compare guest post prices; guest post cost vs niche edit cost", "informational", "P1"),
    "/guest-posting-sites-under-50/": ("guest posting sites under 50 dollars", "affordable guest posting websites", "guest posting websites under $50; affordable guest posting sites for small businesses", "commercial", "P1"),
    "/technology-guest-posting-sites/": ("technology guest posting sites", "technology blogs accepting guest posts", "technology guest posting websites with prices and traffic estimates", "commercial", "P1"),
    "/business-guest-posting-sites/": ("business guest posting sites", "business blogs that accept guest posts", "business guest posting websites with prices", "commercial", "P1"),
    "/health-guest-posting-sites/": ("health guest posting sites", "health blogs accepting guest posts", "how to evaluate health guest post publishers and editorial standards", "commercial", "P2"),
    "/travel-lifestyle-guest-posting-sites/": ("travel guest posting sites", "travel blogs accepting guest posts; lifestyle guest posting sites", "travel guest posting websites with prices", "commercial", "P2"),
    "/saas-guest-posting-sites/": ("guest posting websites for SaaS companies", "SaaS guest posting opportunities", "software and startup websites accepting guest posts", "commercial", "P1"),
    "/marketing-guest-posting-sites/": ("guest posting sites for digital marketing", "marketing guest posting websites", "digital marketing blogs accepting guest posts with prices", "commercial", "P2"),
    "/guest-posting-sites-usa/": ("guest posting sites in USA", "guest posting websites in the United States; USA guest post marketplace", "country-specific guest posting websites with prices in the USA", "commercial", "P1"),
    "/how-to-buy-links/": ("how to choose guest posting websites", "how to find guest posting opportunities", "how to choose relevant guest posting websites before planning a placement", "informational", "P1"),
    "/guides/vet-a-guest-post-site/": ("how to evaluate guest post publishers", "how to identify low-quality publishers", "how to evaluate backlink quality and topical relevance", "informational", "P1"),
    "/guides/da-vs-dr-and-traffic/": ("Domain Authority vs Domain Rating", "how to evaluate publisher traffic", "how to compare supplied DA DR and organic traffic estimates", "informational", "P1"),
    "/guides/paid-guest-posts-google-link-policies/": ("paid guest posts and Google link policies", "dofollow vs nofollow vs sponsored links", "how to qualify paid guest post links with rel sponsored", "informational", "P1"),
    "/guides/guest-post-vs-link-insertion/": ("guest posting vs niche edits", "guest post cost vs niche edit cost; link insertion services explained", "when to choose a new guest post or an existing article insertion", "informational", "P2"),
    "/blog/a-practical-guest-post-budget-worksheet/": ("how to plan a guest posting budget", "guest posting budget worksheet", "how to budget placement prices and separate article writing costs", "informational", "P1"),
    "/domain-length-checker/": ("domain length checker", "domain name length checker", "check ASCII domain length and DNS label limits", "functional tool", "P2"),
    "/bulk-domain-rating-checker/": ("catalogue Domain Rating lookup", "supplied publisher DR lookup", "look up owner-supplied Domain Rating for catalogue publishers", "catalogue tool", "P2"),
}


def main():
    report = json.loads(Path("reports/seo-sprint1-live.json").read_text(encoding="utf-8"))
    rows = []
    for page in report["rows"]:
        path = urlsplit(page["url"]).path
        headings = list(dict.fromkeys(tuple(h) for h in page.get("headings", [])))
        h1 = next((value for tag, value in headings if tag == "h1"), "Requires verification")
        publication = path.startswith("/publication/")
        primary, secondary, long_tail, intent, priority = targets.get(path, (
            (h1 + " guest post placement") if publication else h1,
            "publisher requirements; placement price" if publication else "Editorial review required; do not infer keyword volume from the title",
            (h1 + " guest post price and editorial requirements") if publication else "Editorial review required against actual search queries",
            "publication research" if publication else "existing page intent; editorial review required", "P3",
        ))
        links = [link for link in page.get("internalLinks", []) if not any(part in link for part in ("/publication/", "/cart/", "/my-account/", "/checkout/", "?"))][:10]
        rows.append({
            "canonical_url": page["url"], "primary_keyword": primary,
            "secondary_keywords": secondary, "long_tail_variants": long_tail, "search_intent": intent,
            "reported_monthly_volume": "Not supplied", "page_type": "publication profile" if publication else ("guide/article" if path.startswith(("/guides/", "/blog/")) else "existing landing/resource page"),
            "existing_or_new": "Existing; unchanged content in Sprint 1", "title_tag": page.get("title", "Requires verification"),
            "meta_description": " | ".join(page.get("description", [])), "h1": h1,
            "h2_h3_structure": " | ".join(f"{tag}: {value}" for tag, value in headings if tag in ("h2", "h3")),
            "internal_links": " | ".join(links),
            "conversion_goal": "Review publisher details, compare, save plan or enquire" if publication else "Continue to relevant catalogue, guide or functioning tool; no unverified checkout promise",
            "indexing_status_or_verification": f"HTTP {page.get('status')}; declared canonical/index policy audited {report['checkedAt']}; Google indexing unverified",
            "implementation_priority": priority, "evidence_or_gate": "Observed metadata/headings; keyword assignment is editorial, not measured demand. Navigation/footer headings may occur in raw HTML.",
        })
    for path, primary, variants, gate in [
        ("/guest-posting-sites-uk/", "guest posting sites in UK", "guest posting opportunities in the UK; UK guest posting websites with prices", "Validate sufficient actual UK inventory, source/country definitions and unique guidance"),
        ("/finance-guest-posting-sites/", "finance guest posting sites", "finance websites accepting guest posts", "Validate sufficient Finance inventory and appropriate editorial/financial-topic standards"),
        ("/real-estate-guest-posting-sites/", "real estate guest posting sites", "real estate blogs accepting guest posts", "Validate sufficient Real Estate inventory and unique audience guidance"),
        ("/guest-post-budget-calculator/", "guest posting budget calculator", "how to plan a guest posting budget; compare placement and writing costs", "Ship and test actual calculator before creating an indexable URL"),
    ]:
        rows.append({key: "Planned; requires implementation" for key in rows[0]})
        rows[-1].update(canonical_url=origin + path, primary_keyword=primary, secondary_keywords=variants,
                        long_tail_variants=variants, search_intent="functional tool" if "calculator" in path else "commercial directory",
                        reported_monthly_volume="Not supplied", existing_or_new="Proposed; not created",
                        title_tag=primary.title(), meta_description=f"Planned: {primary}. Final copy must reflect actual available inventory or tool inputs.",
                        h1=primary.capitalize(), h2_h3_structure="Scope and data | How to select/use | Actual results | Limitations | Related guidance",
                        internal_links=origin + "/guest-posting-sites/ | " + origin + "/guides/guest-post-cost/",
                        conversion_goal="Build a relevant placement plan or enquire", indexing_status_or_verification="No route or sitemap entry; keep absent until acceptance",
                        implementation_priority="P2", evidence_or_gate=gate)
    with Path("docs/seo-keyword-inventory-2026.csv").open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"Mapped {len(report['rows'])} existing URLs and 4 gated proposals; no measured volumes inferred.")


if __name__ == "__main__":
    main()

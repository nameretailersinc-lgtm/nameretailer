"""Reviewed Phase 1 URL decisions for the reproducible site audit.

Values are (recommendation, target_url, reason).  These are editorial decisions,
not crawler heuristics; keep them explicit so later crawl re-runs preserve review.
"""

DECISIONS = {}


def add(paths, recommendation, target, reason):
    for path in paths:
        DECISIONS[path] = (recommendation, target, reason)


# Host/protocol normalization discovered by the crawl probes.
DECISIONS["https://www.nameretailer.com/"] = (
    "drop-301→https://nameretailer.com/", "https://nameretailer.com/",
    "Normalize the www host to the canonical HTTPS origin",
)
DECISIONS["http://www.nameretailer.com/"] = (
    "drop-301→https://nameretailer.com/", "https://nameretailer.com/",
    "Normalize HTTP and www in one hop to the canonical origin",
)

add(["/"], "improve", "", "Primary commercial marketplace page; retain and substantially expand trustworthy buyer guidance")
add(["/blog/"], "improve", "", "Keep the blog hub, add one H1, topic navigation and contextual links")
add([
    "/2025/07/12/", "/2025/09/26/", "/2025/10/02/", "/2026/04/26/",
    "/author/admin_123/", "/category/uncategorized/",
], "drop-301→/blog/", "/blog/", "Low-value archive or placeholder taxonomy; consolidate into the maintained blog hub")

add(["/hello-world/", "/test-blog-post/"], "drop-410", "", "WordPress/test content with no durable search intent")
add(["/guest-post-marketplace/"], "merge→/", "/", "Competes with the homepage for the primary marketplace intent")
add(["/guest-post-sites-by-domain-rating-why-dr-matters-link-building-2/"],
    "merge→/guest-post-sites-by-domain-rating-why-dr-matters-link-building/",
    "/guest-post-sites-by-domain-rating-why-dr-matters-link-building/", "Duplicate DR article")
add(["/everything-you-need-to-know-about-guest-blogging-services/"],
    "merge→/guests-blogging-services/", "/guests-blogging-services/",
    "Cannibalizes the commercial guest blogging service page")
add(["/why-guest-posting-still-works-in-2025-and-how-to-get-maximum-seo-value/",
     "/the-real-benefits-of-guest-blogging-you-shouldnt-miss/"],
    "merge→/what-is-guest-posting-and-why-it-still-matters-in-2025/",
    "/what-is-guest-posting-and-why-it-still-matters-in-2025/",
    "Overlapping explanatory guest-posting intent; consolidate into one evergreen guide")
add(["/2824-2/"], "merge→/google-ranking-strategies/", "/google-ranking-strategies/",
    "Opaque slug for an on-page SEO article; fold useful sections into the existing ranking guide")
add([
    "/best-guest-blogging-sites-to-supercharge-your-seo/",
    "/complete-guide-building-high-authority-backlinks-guest-blogging/",
    "/definition-of-domain-authority-understanding-it-clearly/",
    "/guest-post-sites-by-domain-rating-why-dr-matters-link-building/",
    "/how-guest-posts-improve-your-domain-authority-real-results-explained/",
    "/how-to-buy-links/", "/how-to-choose-right-guest-post-package-budget-seo-goals/",
    "/seo-optimized-blog-posts-vs-regular-blog-posts-whats-the-real-difference/",
    "/what-is-guest-posting-and-why-it-still-matters-in-2025/",
    "/what-is-trust-flow-why-it-matters-buying-guest-posts/",
], "improve", "", "Distinct, relevant informational intent; rewrite for accuracy, evidence and internal links")

# Marketplace taxonomy: retain one landing page per intent and collapse metric variants.
add(["/guest-post-by-dr/"], "improve", "", "Canonical landing page for Domain Rating filters")
add(["/dr-0-to-20/", "/dr-20-to-50/", "/dr-50-above/"],
    "merge→/guest-post-by-dr/", "/guest-post-by-dr/", "Thin DR-band pages should be filter states, not competing indexable pages")
add(["/guest-posts-by-majestic-tf-10-to-50/"], "improve", "", "Canonical landing page for Majestic Trust Flow filters")
add(["/trust-flow-0-to-10/", "/trust-flow-10-to-50/", "/trust-flow-21-to-30/",
     "/trust-flow-31-to-40/", "/trust-flow-41-to-50/", "/trust-flow-50-and-above/",
     "/trust-flow-above-50/"],
    "merge→/guest-posts-by-majestic-tf-10-to-50/", "/guest-posts-by-majestic-tf-10-to-50/",
    "Overlapping, thin or empty Trust Flow ranges should become non-indexable filter states")
add(["/guest-posts-by-backlinks/"], "improve", "", "Canonical landing page for backlink-count filtering")
add(["/backlinks-0-to-100k/", "/backlinks-100k-to-500k/", "/backlinks-500k-above/"],
    "merge→/guest-posts-by-backlinks/", "/guest-posts-by-backlinks/", "Thin or empty backlink-band pages should be filter states")
add(["/guest-posts-by-traffic/"], "improve", "", "Canonical landing page for traffic filtering")
add(["/zero-to-50k-traffic/", "/50k-to-500k/", "/100k-to-500k/", "/above-500k/"],
    "merge→/guest-posts-by-traffic/", "/guest-posts-by-traffic/", "Overlapping traffic ranges should be filter states under one useful landing page")
add(["/guest-posts-by-price/", "/price-0-to-50/", "/price-50-to-100/",
     "/price-100-to-150/", "/price-150-to-200/", "/price-200-above/", "/permanent/"],
    "improve", "", "Distinct commercial filter intent with inventory; retain but add unique guidance and correct claims")
add(["/monthly/"], "merge→/guest-posts-by-price/", "/guest-posts-by-price/", "Thin pricing variant duplicates the price hub")
for old, new in [
    ("/monthly-0-to-50/", "/price-0-to-50/"),
    ("/monthly-50-to-100/", "/price-50-to-100/"),
    ("/monthly-100-to-150/", "/price-100-to-150/"),
    ("/monthly-150-to-200/", "/price-150-to-200/"),
    ("/monthly-200-above/", "/price-200-above/"),
]:
    add([old], f"merge→{new}", new, "Duplicate monthly-price page; use the corresponding canonical price band")
add(["/da1toda10/", "/da10toda20/", "/da20toda30/", "/da30toda40/", "/da40toda50/",
     "/da50toda60-sites/", "/da60toda70/", "/da70toda80/", "/da80toda90/", "/da90toda100/"],
    "merge→/guest-post-sites-by-domain-authority/", "/guest-post-sites-by-domain-authority/",
    "Templated DA bands should consolidate into one useful DA landing page with filter states")
add(["/products/"], "merge→/", "/", "Empty generic product archive duplicates the marketplace")

# Services, support and trust pages.
add(["/exclusive-content/", "/niche-blog-posts/"],
    "merge→/content-writing-services/", "/content-writing-services/", "Thin overlapping content-writing offer")
add(["/request-a-custom-blog-post/"], "merge→/buy-blog-posts/", "/buy-blog-posts/", "Same transaction intent as buying a blog post")
add(["/customer-support-2/"], "merge→/help-center/", "/help-center/", "Duplicate support intent and meta description")
add(["/networking-opportunities/", "/writers-community/", "/top-blogging-forums-to-join-and-grow-your-blogging-journey/"],
    "drop-301→/blog/", "/blog/", "Peripheral community content; preserve any useful material in the blog")
add(["/community-guidelines/", "/user-reviews/"], "drop-410", "", "No confirmed community product or verifiable review corpus in scope")
add([
    "/about/", "/buy-blog-posts/", "/content-marketing-services/", "/content-writing-services/",
    "/guests-blogging-services/", "/plagiarism-checking/", "/proofreading-editing/",
    "/seo-optimized-blog-posts/", "/social-media-promotion/", "/contact-us/", "/faq/",
    "/help-center/", "/how-it-works/", "/invoices-billing/", "/payment-methods/",
    "/cookie-policy/", "/copyright-policy/", "/dmca-compliance-policy/", "/refund-policy/",
    "/terms-privacy/", "/user-agreement/", "/custom-login/",
    "/blog-post-formatting-guide/", "/blogging-tips-tricks/", "/google-ranking-strategies/",
    "/headline-writing-tips/", "/keyword-research-guide/", "/popular-article-categories/",
    "/trending-articles/",
], "improve", "", "Retain useful distinct intent; correct metadata, claims, schema and internal linking")

# Owner explicitly requested every current tool be rebuilt. All need substantive copy/UX work.
TOOLS = [
    "/amp-validator/", "/base64-encode-decode/", "/bulk-domain-rating-checker-tool/",
    "/competitor-backlink-analyzer/", "/compress-image/", "/crop-image/", "/file-size-converter/",
    "/hex-to-rgb/", "/high-authority-backlink-generator/", "/image-alt-checker/", "/image-to-bw/",
    "/image-to-webp-converter/", "/jpg-to-png-converter/", "/keyword-density-checker/",
    "/keyword-suggestion-tool/", "/length-converter/", "/online-schema-generator/",
    "/opengraph-generator/", "/png-to-jpg-converter/", "/px-to-rem/", "/resize-image/",
    "/reverse-text/", "/rotate-image/", "/schema-validator/", "/seo-tools/",
    "/temperature-converter/", "/text-case-converter/", "/twitter-card-generator/",
    "/webp-to-png-converter/", "/word-counter/",
]
add(TOOLS, "improve", "", "Owner requires rebuild; add one H1, substantive guidance, honest data provenance and marketplace pathways")


PAGE_TYPE_OVERRIDES = {p: "tool" for p in TOOLS if p != "/seo-tools/"}


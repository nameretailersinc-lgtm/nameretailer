/**
 * Canonical SEO Article Keyword Registry
 * 
 * Exhaustive, typed inventory mapping all 85 editorial articles (25 guides + 60 blog posts)
 * to unique, non-cannibalizing primary keywords, secondary keyword clusters, search intent,
 * and clear topic boundaries.
 * 
 * Sourced from Google Keyword Planner research and existing site topic inventory.
 * Guarantees zero `undefined` values and strict domain/guest-posting separation.
 */

export type ArticleKeywordEntry = {
  slug: string;
  path: string;
  type: "guide" | "blog";
  cluster:
    | "Domain Registration"
    | "Guest Posting"
    | "Marketplace"
    | "Content"
    | "Technical SEO"
    | "AEO"
    | "GEO"
    | "Measurement";
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent:
    | "Informational"
    | "Commercial Investigation"
    | "Informational / Commercial Investigation";
  topicBoundary: string;
  monthlyVolume?: number;
};

export const articleKeywordRegistry: Record<string, ArticleKeywordEntry> = {
  // ==========================================
  // BUYER GUIDES (25 articles)
  // ==========================================

  // Domain Registration (Strictly domain-focused; no guest-posting terms)
  "choose-a-domain-name": {
    slug: "choose-a-domain-name",
    path: "/guides/choose-a-domain-name/",
    type: "guide",
    cluster: "Domain Registration",
    primaryKeyword: "how to choose a domain name for a business",
    secondaryKeywords: [
      "business domain name ideas",
      "choose domain extension",
      "brandable domain checklist",
      "domain naming rules",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Domain name selection criteria, branding, naming conflicts, and extension choices for new businesses. Does not cover registration mechanics or technical migrations.",
  },
  "buy-and-register-a-domain-name": {
    slug: "buy-and-register-a-domain-name",
    path: "/guides/buy-and-register-a-domain-name/",
    type: "guide",
    cluster: "Domain Registration",
    primaryKeyword: "how to buy and register a domain name",
    secondaryKeywords: [
      "domain name registration guide",
      "how to purchase a domain",
      "domain registrar comparison",
      "whois privacy and dns setup",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Step-by-step domain purchase, registrar selection, DNS configuration, and WHOIS privacy management. Does not cover creative naming or SEO migrations.",
  },
  "domain-name-seo-and-migrations": {
    slug: "domain-name-seo-and-migrations",
    path: "/guides/domain-name-seo-and-migrations/",
    type: "guide",
    cluster: "Domain Registration",
    primaryKeyword: "domain name seo and website migrations",
    secondaryKeywords: [
      "website domain migration seo",
      "301 redirect domain",
      "changing domain name without losing seo",
      "search console change of address",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Moving an established site to a new domain name, URL redirect mapping, canonical preservation, and Search Console change of address procedures.",
  },

  // Guest Posting Guides (22 articles)
  "guest-posting-for-beginners": {
    slug: "guest-posting-for-beginners",
    path: "/guides/guest-posting-for-beginners/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting for beginners",
    secondaryKeywords: [
      "beginner guest blogging guide",
      "how guest posting works",
      "start guest blogging",
      "guest blogging basics",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Foundational primer on what guest posting is, how the process works from idea to publication, and beginner workflow fundamentals. Distinct from detailed prospecting or pitching.",
  },
  "find-guest-posting-opportunities": {
    slug: "find-guest-posting-opportunities",
    path: "/guides/find-guest-posting-opportunities/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "how to find guest posting opportunities",
    secondaryKeywords: [
      "find guest post sites",
      "guest blogging search operators",
      "guest posting prospect list",
      "guest blogging websites",
    ],
    searchIntent: "Informational",
    monthlyVolume: 50,
    topicBoundary:
      "Prospecting methods, Google search footprints, reverse-engineering competitor backlink profiles, and verifying active submission policies.",
  },
  "guest-post-outreach-templates": {
    slug: "guest-post-outreach-templates",
    path: "/guides/guest-post-outreach-templates/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest post outreach email template",
    secondaryKeywords: [
      "guest blogging pitch templates",
      "cold outreach email for guest posts",
      "pitch follow up email",
      "guest post email pitch",
    ],
    searchIntent: "Informational",
    monthlyVolume: 50,
    topicBoundary:
      "Email pitch copy, subject lines, personalized angles, follow-up cadence, and editor response handling.",
  },
  "write-a-guest-post": {
    slug: "write-a-guest-post",
    path: "/guides/write-a-guest-post/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "how to write a guest post",
    secondaryKeywords: [
      "guest article writing guidelines",
      "writing for other blogs",
      "guest post formatting",
      "drafting an article for an editor",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Drafting the contributed article itself: fitting host editorial style, citing credible sources, formatting headings, and author bio guidelines.",
  },
  "guest-post-submission-guidelines": {
    slug: "guest-post-submission-guidelines",
    path: "/guides/guest-post-submission-guidelines/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest post submission guidelines",
    secondaryKeywords: [
      "guest post editorial guidelines",
      "write for us guidelines",
      "publisher submission criteria",
      "guest article formatting rules",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Understanding, reviewing, and adhering to host publisher editorial guidelines, revision terms, image rights, and disclosure clauses.",
  },
  "guest-posting-strategy": {
    slug: "guest-posting-strategy",
    path: "/guides/guest-posting-strategy/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting strategy",
    secondaryKeywords: [
      "guest blogging campaign strategy",
      "guest posting roadmap",
      "link acquisition strategy",
      "strategic guest blogging plan",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "High-level strategic campaign planning, audience targeting, capacity and budget allocation, and alignment with business goals.",
  },
  "guest-posting-vs-content-marketing": {
    slug: "guest-posting-vs-content-marketing",
    path: "/guides/guest-posting-vs-content-marketing/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting vs content marketing",
    secondaryKeywords: [
      "guest blogging versus on-site content",
      "content marketing distribution",
      "content strategy comparison",
      "publishing on your own blog vs guest posting",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Strategic comparison of publishing on owned media vs contributing to external publications, analyzing resource allocation and audience ownership.",
  },
  "guest-posting-vs-digital-pr": {
    slug: "guest-posting-vs-digital-pr",
    path: "/guides/guest-posting-vs-digital-pr/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting vs digital pr",
    secondaryKeywords: [
      "digital pr versus guest blogging",
      "link acquisition tactics",
      "press coverage vs guest post",
      "journalistic outreach vs contributed articles",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Comparing contributed bylines with journalist pitches, press releases, newsjacking, and data-driven digital PR campaigns.",
  },
  "free-vs-paid-guest-posting": {
    slug: "free-vs-paid-guest-posting",
    path: "/guides/free-vs-paid-guest-posting/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "free vs paid guest posting",
    secondaryKeywords: [
      "paid guest posting sites",
      "editorial guest posts vs sponsored",
      "guest post cost comparison",
      "free guest blogging pros and cons",
    ],
    searchIntent: "Informational / Commercial Investigation",
    topicBoundary:
      "Evaluating the trade-offs between unpaid pitch-based contributions and commercial placement fees, editorial control, and time investment.",
  },
  "guest-posting-for-small-businesses": {
    slug: "guest-posting-for-small-businesses",
    path: "/guides/guest-posting-for-small-businesses/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting for small businesses",
    secondaryKeywords: [
      "small business link building",
      "smb guest blogging guide",
      "affordable guest posting",
      "local business link acquisition",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Practical execution for resource-constrained small businesses, focusing on niche authority, local relevance, and sustainable workflows.",
  },
  "check-guest-post-website-traffic": {
    slug: "check-guest-post-website-traffic",
    path: "/guides/check-guest-post-website-traffic/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "how to check website traffic before guest posting",
    secondaryKeywords: [
      "verify publisher organic traffic",
      "ahrefs traffic check",
      "evaluate guest blog traffic",
      "traffic trend analysis for publishers",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Methods for verifying publisher traffic estimates, analyzing geographic audience distribution, and detecting artificial traffic spikes.",
  },
  "guest-posting-for-local-seo": {
    slug: "guest-posting-for-local-seo",
    path: "/guides/guest-posting-for-local-seo/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting for local seo",
    secondaryKeywords: [
      "local link building guest post",
      "geo-targeted guest blogging",
      "city business citations",
      "local community blog outreach",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Acquiring backlinks from regional publications, city news outlets, and chamber blogs to strengthen local search rankings.",
  },
  "guest-posting-for-ecommerce": {
    slug: "guest-posting-for-ecommerce",
    path: "/guides/guest-posting-for-ecommerce/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting for ecommerce",
    secondaryKeywords: [
      "ecommerce link building",
      "product review guest post",
      "online store backlink strategy",
      "ecommerce content distribution",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Guest posting strategies for online retailers: lifestyle publications, gift guides, product buying advice, and ethical commercial link handling.",
  },
  "measure-guest-posting-results": {
    slug: "measure-guest-posting-results",
    path: "/guides/measure-guest-posting-results/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "how to measure guest posting results",
    secondaryKeywords: [
      "track guest post traffic",
      "guest post conversion tracking",
      "campaign attribution seo",
      "measuring guest blogging roi",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Setting up UTM parameters, tracking referral conversions, monitoring non-branded organic impressions, and evaluating campaign ROI.",
  },
  "guest-posting-mistakes": {
    slug: "guest-posting-mistakes",
    path: "/guides/guest-posting-mistakes/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting mistakes to avoid",
    secondaryKeywords: [
      "guest blogging errors",
      "common link building pitfalls",
      "bad outreach mistakes",
      "guest post quality failures",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Catalog of high-cost mistakes in guest posting: mass untargeted pitches, ignoring guidelines, over-optimized anchor text, and neglecting audience fit.",
  },
  "guest-posting-checklist": {
    slug: "guest-posting-checklist",
    path: "/guides/guest-posting-checklist/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting checklist before publishing",
    secondaryKeywords: [
      "guest post editorial checklist",
      "pre-publish quality check",
      "guest post verification",
      "link placement verification",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Operational pre-flight checklist to verify formatting, image licensing, canonical headers, link tags, and bylines before final publishing.",
  },
  "guest-post-cost": {
    slug: "guest-post-cost",
    path: "/guides/guest-post-cost/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest post price",
    secondaryKeywords: [
      "guest post cost",
      "paid guest posting sites",
      "guest post pricing factors",
      "guest blogging fees by niche",
    ],
    searchIntent: "Commercial Investigation",
    monthlyVolume: 50,
    topicBoundary:
      "Granular price benchmarks across industries, placement fee structures, writing add-ons, and total cost of ownership for guest posting campaigns.",
  },
  "guest-post-vs-link-insertion": {
    slug: "guest-post-vs-link-insertion",
    path: "/guides/guest-post-vs-link-insertion/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest post vs link insertion",
    secondaryKeywords: [
      "niche edits vs guest posting",
      "contextual backlink insertion",
      "existing article link placement",
      "link insertion pricing vs guest post",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Comparing authoring new guest articles against securing contextual backlink edits on already-indexed, aged articles.",
  },
  "da-vs-dr-and-traffic": {
    slug: "da-vs-dr-and-traffic",
    path: "/guides/da-vs-dr-and-traffic/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "da vs dr and website traffic",
    secondaryKeywords: [
      "domain authority vs domain rating",
      "moz da vs ahrefs dr",
      "publisher metric evaluation",
      "comparing backlink metrics",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Comparing Moz Domain Authority and Ahrefs Domain Rating formulas, update cycles, index sizes, and relationship to organic search traffic.",
  },
  "vet-a-guest-post-site": {
    slug: "vet-a-guest-post-site",
    path: "/guides/vet-a-guest-post-site/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest posting sites list",
    secondaryKeywords: [
      "how to vet guest post sites",
      "guest posting platform review",
      "publisher quality audit",
      "spotting private blog networks",
    ],
    searchIntent: "Informational / Commercial Investigation",
    monthlyVolume: 500,
    topicBoundary:
      "How to audit a guest posting sites list or directory: vetting organic traffic legitimacy, checking outbound link velocity, spotting PBN footprints, and verifying editorial rigor.",
  },
  "paid-guest-posts-google-link-policies": {
    slug: "paid-guest-posts-google-link-policies",
    path: "/guides/paid-guest-posts-google-link-policies/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "paid guest posts and google link policies",
    secondaryKeywords: [
      "rel sponsored guest posts",
      "nofollow vs sponsored link",
      "google link spam policy",
      "qualifying paid placement links",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Technical compliance with Google Search Essentials link spam policies, proper usage of rel=\"sponsored\" and rel=\"nofollow\", and penalty avoidance.",
  },
  "guest-post-vs-sponsored-post": {
    slug: "guest-post-vs-sponsored-post",
    path: "/guides/guest-post-vs-sponsored-post/",
    type: "guide",
    cluster: "Guest Posting",
    primaryKeyword: "guest post vs sponsored post",
    secondaryKeywords: [
      "sponsored article disclosure",
      "paid placement vs editorial guest blog",
      "ftc endorsement guidelines",
      "sponsored post rules",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Legal and regulatory distinctions under FTC guidelines between organic contributed thought leadership and sponsored advertorial content.",
  },

  // ==========================================
  // BLOG POSTS (60 articles)
  // ==========================================

  // Group 1: Marketplace & Content (20 articles)
  "how-to-choose-a-guest-post-publication-for-your-audience": {
    slug: "how-to-choose-a-guest-post-publication-for-your-audience",
    path: "/blog/how-to-choose-a-guest-post-publication-for-your-audience/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "how to choose a guest post publication",
    secondaryKeywords: [
      "evaluate publisher audience fit",
      "guest posting target criteria",
      "guest post selection workflow",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Matching prospective publications to reader demographics and industry stage rather than purely relying on vanity domain metrics.",
  },
  "a-practical-guest-post-budget-worksheet": {
    slug: "a-practical-guest-post-budget-worksheet",
    path: "/blog/a-practical-guest-post-budget-worksheet/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "guest post budget worksheet",
    secondaryKeywords: [
      "guest post cost planning",
      "placement budget spreadsheet",
      "link building budget template",
    ],
    searchIntent: "Informational / Commercial Investigation",
    topicBoundary:
      "Structuring placement budgets across publication fees, content creation, copywriting revisions, and campaign management.",
  },
  "domain-rating-and-domain-authority-a-comparison-worksheet": {
    slug: "domain-rating-and-domain-authority-a-comparison-worksheet",
    path: "/blog/domain-rating-and-domain-authority-a-comparison-worksheet/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "domain rating and domain authority worksheet",
    secondaryKeywords: [
      "dr vs da comparison worksheet",
      "publisher authority logging",
      "seo metrics tracking sheet",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Logging and maintaining separate columns for DR and DA with provider timestamps to avoid treating disparate scores as identical.",
  },
  "how-to-read-a-publication-traffic-estimate": {
    slug: "how-to-read-a-publication-traffic-estimate",
    path: "/blog/how-to-read-a-publication-traffic-estimate/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "how to read publication traffic estimates",
    secondaryKeywords: [
      "understand publisher traffic metrics",
      "organic traffic estimation accuracy",
      "semrush ahrefs traffic interpretation",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Understanding third-party organic search traffic modeling, confidence intervals, and seasonal variations on publisher domains.",
  },
  "what-to-confirm-in-a-guest-post-placement-brief": {
    slug: "what-to-confirm-in-a-guest-post-placement-brief",
    path: "/blog/what-to-confirm-in-a-guest-post-placement-brief/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "guest post placement brief requirements",
    secondaryKeywords: [
      "placement terms confirmation",
      "guest post agreement details",
      "publisher deliverables brief",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Documenting essential contractual terms: link attributes, publishing turnaround, indexing guarantees, and live URL permanence.",
  },
  "paid-link-disclosure-questions-to-ask-before-placement": {
    slug: "paid-link-disclosure-questions-to-ask-before-placement",
    path: "/blog/paid-link-disclosure-questions-to-ask-before-placement/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "paid link disclosure questions",
    secondaryKeywords: [
      "rel sponsored disclosure questions",
      "publisher link attribute inquiry",
      "sponsored post compliance questions",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Clarifying how host publishers label paid contributions, apply rel attributes, and handle FTC disclosures prior to paying invoices.",
  },
  "how-to-compare-publication-language-and-geography": {
    slug: "how-to-compare-publication-language-and-geography",
    path: "/blog/how-to-compare-publication-language-and-geography/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "compare publication language and audience geography",
    secondaryKeywords: [
      "international guest posting",
      "regional publisher audience",
      "language targeting guest posts",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Aligning publisher audience geographic distribution and language nuances with business market expansion goals.",
  },
  "an-editorial-review-checklist-for-a-publication-shortlist": {
    slug: "an-editorial-review-checklist-for-a-publication-shortlist",
    path: "/blog/an-editorial-review-checklist-for-a-publication-shortlist/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "publication shortlist editorial review checklist",
    secondaryKeywords: [
      "vetting publisher shortlist",
      "content quality review host blog",
      "editorial standards check",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Evaluating publication recency, comment moderation, editorial writing quality, and author credential transparency.",
  },
  "placement-only-versus-article-writing-packages": {
    slug: "placement-only-versus-article-writing-packages",
    path: "/blog/placement-only-versus-article-writing-packages/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "placement only versus article writing packages",
    secondaryKeywords: [
      "guest post writing packages",
      "placement only pricing",
      "copywriting vs publishing fees",
    ],
    searchIntent: "Informational / Commercial Investigation",
    topicBoundary:
      "Comparing in-house drafting with agency/marketplace writing packages, examining quality control and total cost differences.",
  },
  "what-to-record-after-a-placement-is-published": {
    slug: "what-to-record-after-a-placement-is-published",
    path: "/blog/what-to-record-after-a-placement-is-published/",
    type: "blog",
    cluster: "Marketplace",
    primaryKeyword: "what to record after guest post is published",
    secondaryKeywords: [
      "post publish link logging",
      "guest post inventory tracking",
      "backlink record keeping",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Building a post-publication audit log: live URL, live date, target anchor, destination URL, robots meta status, and initial snapshot.",
  },
  "how-to-write-a-guest-post-brief-an-editor-can-use": {
    slug: "how-to-write-a-guest-post-brief-an-editor-can-use",
    path: "/blog/how-to-write-a-guest-post-brief-an-editor-can-use/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "guest post editorial brief template",
    secondaryKeywords: [
      "content brief for guest post",
      "editor friendly article pitch",
      "guest article outline template",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Structuring editorial briefs that host editors can review quickly: target audience, proposed angle, subheadings, and unique data points.",
  },
  "match-article-structure-to-the-reader-s-search-intent": {
    slug: "match-article-structure-to-the-reader-s-search-intent",
    path: "/blog/match-article-structure-to-the-reader-s-search-intent/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "how to write seo friendly blog posts",
    secondaryKeywords: [
      "blog post seo checklist",
      "search intent content structure",
      "write for search intent",
      "heading hierarchy seo",
    ],
    searchIntent: "Informational",
    monthlyVolume: 500,
    topicBoundary:
      "Architecting articles around user search intent: direct answer placement, logical H2/H3 hierarchy, and clear takeaway summaries.",
  },
  "write-a-direct-answer-without-losing-important-context": {
    slug: "write-a-direct-answer-without-losing-important-context",
    path: "/blog/write-a-direct-answer-without-losing-important-context/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "how to write direct answers for search",
    secondaryKeywords: [
      "concise answers seo",
      "featured snippet writing",
      "direct answer lead paragraph",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Crafting concise direct answers for featured snippets and AI overviews while preserving technical nuances and necessary prerequisites.",
  },
  "a-source-log-for-fact-checking-content-drafts": {
    slug: "a-source-log-for-fact-checking-content-drafts",
    path: "/blog/a-source-log-for-fact-checking-content-drafts/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "source log for content fact checking",
    secondaryKeywords: [
      "editorial fact checking log",
      "content source verification",
      "citing primary sources seo",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Maintaining an audit trail of primary source documentation for statistics, official documentation quotes, and data claims.",
  },
  "headlines-that-describe-the-article-instead-of-overselling-it": {
    slug: "headlines-that-describe-the-article-instead-of-overselling-it",
    path: "/blog/headlines-that-describe-the-article-instead-of-overselling-it/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "how to write descriptive seo headlines",
    secondaryKeywords: [
      "accurate title tags",
      "avoid clickbait titles",
      "descriptive h1 headlines",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Writing honest, descriptive H1 tags and title tags that accurately represent page scope and avoid misleading clickbait expectations.",
  },
  "meta-descriptions-that-help-readers-choose-a-page": {
    slug: "meta-descriptions-that-help-readers-choose-a-page",
    path: "/blog/meta-descriptions-that-help-readers-choose-a-page/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "how to write meta descriptions for click through rate",
    secondaryKeywords: [
      "meta description best practices",
      "serp snippet optimization",
      "informative meta descriptions",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Drafting 140-160 character meta descriptions that clearly summarize reader benefits and increase organic SERP click-through rate.",
  },
  "how-to-write-helpful-faq-answers": {
    slug: "how-to-write-helpful-faq-answers",
    path: "/blog/how-to-write-helpful-faq-answers/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "how to write helpful faq answers for seo",
    secondaryKeywords: [
      "faq content optimization",
      "answering common questions",
      "structured faq copywriting",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Formulating standalone FAQ answers that solve genuine user inquiries without redundant fluff or internal cannibalization.",
  },
  "image-alt-text-describe-purpose-not-every-pixel": {
    slug: "image-alt-text-describe-purpose-not-every-pixel",
    path: "/blog/image-alt-text-describe-purpose-not-every-pixel/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "image alt text best practices for seo",
    secondaryKeywords: [
      "accessible alt text guidelines",
      "writing image alt tags",
      "descriptive alt text examples",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Writing purposeful, contextual alt text for accessibility and search engines without keyword stuffing or meaningless visual descriptions.",
  },
  "a-content-refresh-decision-log": {
    slug: "a-content-refresh-decision-log",
    path: "/blog/a-content-refresh-decision-log/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "seo content audit checklist",
    secondaryKeywords: [
      "content refresh decision framework",
      "updating old blog posts",
      "content decay audit",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Framework for deciding whether to update, merge, redirect, or prune decaying content based on Search Console impressions and conversions.",
  },
  "an-editorial-handoff-checklist-before-publication": {
    slug: "an-editorial-handoff-checklist-before-publication",
    path: "/blog/an-editorial-handoff-checklist-before-publication/",
    type: "blog",
    cluster: "Content",
    primaryKeyword: "editorial handoff checklist before publishing",
    secondaryKeywords: [
      "pre publish content quality assurance",
      "editorial proofing checklist",
      "blog publishing workflow",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Final verification workflow passing drafts from copywriters to managing editors, ensuring style guide compliance and factual integrity.",
  },

  // Group 2: Technical SEO & AEO (20 articles)
  "a-canonical-url-checklist-for-a-rebuilt-website": {
    slug: "a-canonical-url-checklist-for-a-rebuilt-website",
    path: "/blog/a-canonical-url-checklist-for-a-rebuilt-website/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "technical seo audit checklist",
    secondaryKeywords: [
      "canonical url audit",
      "duplicate content prevention",
      "canonical tag checklist",
      "technical seo audit template",
    ],
    searchIntent: "Informational",
    monthlyVolume: 500,
    topicBoundary:
      "Auditing self-referencing canonical tags, protocol consolidation, parameter normalization, and trailing slash consistency during site migrations.",
  },
  "internal-links-that-make-an-article-library-easier-to-use": {
    slug: "internal-links-that-make-an-article-library-easier-to-use",
    path: "/blog/internal-links-that-make-an-article-library-easier-to-use/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "internal links seo",
    secondaryKeywords: [
      "internal linking and seo",
      "internal linking strategy for seo",
      "contextual internal links",
      "hub and spoke architecture",
    ],
    searchIntent: "Informational",
    monthlyVolume: 5000,
    topicBoundary:
      "Contextual internal linking architecture, topic cluster routing, anchor text diversity, and crawl depth reduction.",
  },
  "noindex-and-robots-txt-are-different-controls": {
    slug: "noindex-and-robots-txt-are-different-controls",
    path: "/blog/noindex-and-robots-txt-are-different-controls/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "noindex vs robots txt differences",
    secondaryKeywords: [
      "robots txt disallow vs noindex",
      "crawling vs indexing controls",
      "googlebot crawl directives",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Distinguishing crawl prevention via robots.txt disallow rules from index exclusion via robots meta noindex tags.",
  },
  "plan-a-sitemap-around-approved-public-pages": {
    slug: "plan-a-sitemap-around-approved-public-pages",
    path: "/blog/plan-a-sitemap-around-approved-public-pages/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "xml sitemap best practices for crawl budget",
    secondaryKeywords: [
      "sitemap index configuration",
      "dynamic nextjs sitemap",
      "indexable urls in sitemaps",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Designing clean XML sitemaps that strictly include 200 OK indexable canonical pages and exclude 301 redirects, 404s, and noindexed URLs.",
  },
  "a-structured-data-review-checklist-for-blog-articles": {
    slug: "a-structured-data-review-checklist-for-blog-articles",
    path: "/blog/a-structured-data-review-checklist-for-blog-articles/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "article schema markup example",
    secondaryKeywords: [
      "blogposting schema json ld",
      "schema markup audit",
      "article structured data checklist",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Validating Article, BlogPosting, and BreadcrumbList JSON-LD schema against visible content without fabricating ratings or fake authors.",
  },
  "check-server-rendered-article-content-before-launch": {
    slug: "check-server-rendered-article-content-before-launch",
    path: "/blog/check-server-rendered-article-content-before-launch/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "technical seo checklist",
    secondaryKeywords: [
      "server rendered content seo",
      "pre launch technical seo checks",
      "javascript seo audit",
      "ssr hydration checks",
    ],
    searchIntent: "Informational",
    monthlyVolume: 500,
    topicBoundary:
      "Pre-launch verification verifying that critical editorial text, headings, and schema are delivered in initial raw HTTP server responses.",
  },
  "a-responsive-article-page-qa-checklist": {
    slug: "a-responsive-article-page-qa-checklist",
    path: "/blog/a-responsive-article-page-qa-checklist/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "mobile seo qa checklist for article pages",
    secondaryKeywords: [
      "mobile responsiveness audit",
      "viewport testing seo",
      "responsive layout quality assurance",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Auditing article layout readability, table overflow handling, touch targets, and viewport performance across mobile devices.",
  },
  "choose-image-dimensions-and-formats-deliberately": {
    slug: "choose-image-dimensions-and-formats-deliberately",
    path: "/blog/choose-image-dimensions-and-formats-deliberately/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "nextjs image optimization and core web vitals",
    secondaryKeywords: [
      "webp vs avif image formats",
      "prevent cumulative layout shift",
      "image compression seo",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Optimizing editorial image delivery: WebP/AVIF conversions, responsive srcset generation, and explicit aspect ratios to eliminate CLS.",
  },
  "measure-page-experience-with-a-repeatable-test-setup": {
    slug: "measure-page-experience-with-a-repeatable-test-setup",
    path: "/blog/measure-page-experience-with-a-repeatable-test-setup/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "core web vitals testing and measurement",
    secondaryKeywords: [
      "inp lcp cls measurement",
      "repeatable lighthouse testing",
      "page experience monitoring",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Configuring repeatable lab testing and field telemetry for Core Web Vitals (LCP, INP, CLS) across desktop and mobile devices.",
  },
  "a-wordpress-to-next-js-content-migration-worksheet": {
    slug: "a-wordpress-to-next-js-content-migration-worksheet",
    path: "/blog/a-wordpress-to-next-js-content-migration-worksheet/",
    type: "blog",
    cluster: "Technical SEO",
    primaryKeyword: "wordpress to nextjs content migration checklist",
    secondaryKeywords: [
      "wordpress migration 301 redirects",
      "nextjs seo migration",
      "headless cms content migration",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Operational worksheet for migrating from WordPress to Next.js App Router: URL redirects, media migration, metadata parity, and SEO cutover.",
  },
  "what-aeo-means-in-a-practical-content-workflow": {
    slug: "what-aeo-means-in-a-practical-content-workflow",
    path: "/blog/what-aeo-means-in-a-practical-content-workflow/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "answer engine optimization",
    secondaryKeywords: [
      "what is aeo",
      "aeo content strategy",
      "optimizing for answer engines",
      "direct answer search optimization",
    ],
    searchIntent: "Informational",
    monthlyVolume: 5000,
    topicBoundary:
      "Core definitions, principles, and workflows of Answer Engine Optimization (AEO), structuring content for direct extraction by AI search engines.",
  },
  "build-a-question-map-before-drafting-answer-led-content": {
    slug: "build-a-question-map-before-drafting-answer-led-content",
    path: "/blog/build-a-question-map-before-drafting-answer-led-content/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "answer engine optimization checklist",
    secondaryKeywords: [
      "question mapping for aeo",
      "answer led content strategy",
      "informational intent questions",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Gathering and clustering real user questions from Search Console and community inquiries before writing answer-focused content.",
  },
  "definitions-that-remain-useful-outside-their-paragraph": {
    slug: "definitions-that-remain-useful-outside-their-paragraph",
    path: "/blog/definitions-that-remain-useful-outside-their-paragraph/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "extractable definitions for ai search optimization",
    secondaryKeywords: [
      "writing self contained definitions",
      "aeo definition formatting",
      "clear semantic explanations",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Authoring atomic, self-contained definitions of technical concepts that retain complete semantic accuracy when cited in isolation.",
  },
  "comparison-tables-that-preserve-meaningful-differences": {
    slug: "comparison-tables-that-preserve-meaningful-differences",
    path: "/blog/comparison-tables-that-preserve-meaningful-differences/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "structured comparison tables for aeo",
    secondaryKeywords: [
      "html table schema for answer engines",
      "structured data tables",
      "clear entity comparisons",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Designing accessible HTML comparison tables with explicit headers, scope attributes, and factual differentiation for search parser extraction.",
  },
  "use-examples-to-make-an-answer-actionable": {
    slug: "use-examples-to-make-an-answer-actionable",
    path: "/blog/use-examples-to-make-an-answer-actionable/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "actionable examples in informational content",
    secondaryKeywords: [
      "concrete examples for search",
      "contextual illustrations",
      "practical guidance seo",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Supplementing theoretical definitions with concrete, real-world examples and step-by-step illustrations that clarify reader execution.",
  },
  "keep-important-answers-available-as-readable-text": {
    slug: "keep-important-answers-available-as-readable-text",
    path: "/blog/keep-important-answers-available-as-readable-text/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "rendered text accessibility for search engines",
    secondaryKeywords: [
      "text based answers vs hidden tabs",
      "crawlable content accessibility",
      "avoiding accordion cloaking",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Ensuring primary answers are rendered as visible, crawlable HTML text rather than trapped inside images, complex canvas, or hidden tabs.",
  },
  "how-to-audit-an-answer-for-unsupported-certainty": {
    slug: "how-to-audit-an-answer-for-unsupported-certainty",
    path: "/blog/how-to-audit-an-answer-for-unsupported-certainty/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "factual accuracy and source attribution in content",
    secondaryKeywords: [
      "content verification audit",
      "avoid unsupported claims",
      "citation accuracy seo",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Auditing drafts to remove unwarranted definitive assertions, replacing subjective claims with verifiable evidence and measured boundaries.",
  },
  "plan-useful-follow-up-answers-without-duplicating-pages": {
    slug: "plan-useful-follow-up-answers-without-duplicating-pages",
    path: "/blog/plan-useful-follow-up-answers-without-duplicating-pages/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "preventing keyword cannibalization in content clusters",
    secondaryKeywords: [
      "topic cluster follow ups",
      "avoid page duplication",
      "distinct subtopic boundaries",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Structuring logical follow-up questions within single authoritative articles rather than spinning off near-duplicate thin posts.",
  },
  "aeo-readiness-is-not-the-same-as-indexing-approval": {
    slug: "aeo-readiness-is-not-the-same-as-indexing-approval",
    path: "/blog/aeo-readiness-is-not-the-same-as-indexing-approval/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "aeo vs seo",
    secondaryKeywords: [
      "answer engine optimization vs seo",
      "search indexability vs ai summary",
      "aeo differences",
      "search engine indexing vs ai citations",
    ],
    searchIntent: "Informational",
    monthlyVolume: 5000,
    topicBoundary:
      "Analyzing how traditional search engine crawling and indexation prerequisites differ from and precede generative AI citation eligibility.",
  },
  "an-answer-quality-review-sheet-for-editors": {
    slug: "an-answer-quality-review-sheet-for-editors",
    path: "/blog/an-answer-quality-review-sheet-for-editors/",
    type: "blog",
    cluster: "AEO",
    primaryKeyword: "editorial answer quality rubric for search",
    secondaryKeywords: [
      "answer quality checklist",
      "reviewing direct answers",
      "content evaluation rubric",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Standardized editorial scoring rubric for evaluating direct answers: clarity, directness, absence of filler, and source verifiability.",
  },

  // Group 3: GEO & Measurement (20 articles)
  "what-geo-means-for-a-small-content-team": {
    slug: "what-geo-means-for-a-small-content-team",
    path: "/blog/what-geo-means-for-a-small-content-team/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "generative engine optimization",
    secondaryKeywords: [
      "what is geo",
      "geo strategy for small teams",
      "optimizing for generative search",
      "ai overview visibility",
    ],
    searchIntent: "Informational",
    monthlyVolume: 5000,
    topicBoundary:
      "Foundational principles of Generative Engine Optimization (GEO): how LLMs synthesize multi-source answers and how small teams position their brand.",
  },
  "build-an-evidence-inventory-before-writing-brand-claims": {
    slug: "build-an-evidence-inventory-before-writing-brand-claims",
    path: "/blog/build-an-evidence-inventory-before-writing-brand-claims/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "how to optimize content for ai search",
    secondaryKeywords: [
      "brand evidence inventory",
      "grounding claims for llms",
      "verifiable content claims",
      "ai search optimization strategy",
    ],
    searchIntent: "Informational",
    monthlyVolume: 500,
    topicBoundary:
      "Compiling verifiable proof points (case studies, telemetry, dates, credentials) before publishing claims to facilitate AI ground-truth verification.",
  },
  "keep-organization-information-consistent-across-content": {
    slug: "keep-organization-information-consistent-across-content",
    path: "/blog/keep-organization-information-consistent-across-content/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "entity clarity and schema consistency for llms",
    secondaryKeywords: [
      "knowledge graph consistency",
      "brand entity optimization",
      "schema org organization data",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Standardizing organizational naming, address, founders, and product identities across website copy and JSON-LD schema to avoid entity confusion in knowledge graphs.",
  },
  "original-observations-versus-hypothetical-examples": {
    slug: "original-observations-versus-hypothetical-examples",
    path: "/blog/original-observations-versus-hypothetical-examples/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "first hand experience and original research in seo",
    secondaryKeywords: [
      "google e e a t first hand experience",
      "genuine case data vs hypothetical",
      "content originality",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Distinguishing genuine primary data and tested observations from hypothetical scenarios to build Google E-E-A-T and LLM citation trust.",
  },
  "a-citation-ready-claim-has-a-clear-source-boundary": {
    slug: "a-citation-ready-claim-has-a-clear-source-boundary",
    path: "/blog/a-citation-ready-claim-has-a-clear-source-boundary/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "how to get cited by ai search engines",
    secondaryKeywords: [
      "ai search citations",
      "attribution ready statements",
      "citation boundaries in content",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Writing clear attribution boundaries around research conclusions so generative engines can extract and cite the specific entity responsible for the finding.",
  },
  "geo-content-planning-without-publishing-query-duplicates": {
    slug: "geo-content-planning-without-publishing-query-duplicates",
    path: "/blog/geo-content-planning-without-publishing-query-duplicates/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "generative engine optimization guide",
    secondaryKeywords: [
      "geo planning framework",
      "avoid synthetic query bloat",
      "topic consolidation for generative search",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Preventing programmatic content bloat and thin query permutations when architecting content strategies targeted at generative search engines.",
  },
  "a-fair-comparison-page-brief-for-a-brand-website": {
    slug: "a-fair-comparison-page-brief-for-a-brand-website",
    path: "/blog/a-fair-comparison-page-brief-for-a-brand-website/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "objective product comparison page guidelines",
    secondaryKeywords: [
      "balanced comparison guides",
      "competitor comparison seo",
      "transparent product reviews",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Drafting transparent, objective comparison articles that fairly state competitor strengths, building credibility with both readers and AI synthesizers.",
  },
  "ai-crawler-access-needs-a-documented-product-specific-policy": {
    slug: "ai-crawler-access-needs-a-documented-product-specific-policy",
    path: "/blog/ai-crawler-access-needs-a-documented-product-specific-policy/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "llms txt for seo",
    secondaryKeywords: [
      "ai bot crawler directives",
      "gptbot perpexitybot control",
      "documented crawler policy",
      "emerging llms txt proposals",
    ],
    searchIntent: "Informational",
    monthlyVolume: 500,
    topicBoundary:
      "Formulating explicit organizational policies for AI crawlers (GPTBot, ClaudeBot, PerplexityBot) via robots.txt, distinguishing established standards from proposals like llms.txt.",
  },
  "record-generative-search-appearances-as-observations": {
    slug: "record-generative-search-appearances-as-observations",
    path: "/blog/record-generative-search-appearances-as-observations/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "tracking brand mentions in generative search",
    secondaryKeywords: [
      "ai overview tracking",
      "perplexity citation monitoring",
      "recording generative search presence",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Logging dynamic AI overview appearances and conversational chatbot citations as time-stamped observations without mistaking point-in-time answers for permanent rankings.",
  },
  "a-geo-experiment-brief-with-a-useful-stopping-rule": {
    slug: "a-geo-experiment-brief-with-a-useful-stopping-rule",
    path: "/blog/a-geo-experiment-brief-with-a-useful-stopping-rule/",
    type: "blog",
    cluster: "GEO",
    primaryKeyword: "geo vs seo",
    secondaryKeywords: [
      "generative engine optimization vs traditional seo",
      "ai search experiments",
      "controlled geo tests",
    ],
    searchIntent: "Informational",
    monthlyVolume: 5000,
    topicBoundary:
      "Designing controlled empirical experiments to evaluate generative visibility changes, establishing test hypotheses and predefined stopping rules.",
  },
  "a-practical-seo-measurement-plan-before-publishing": {
    slug: "a-practical-seo-measurement-plan-before-publishing",
    path: "/blog/a-practical-seo-measurement-plan-before-publishing/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "how to measure seo performance",
    secondaryKeywords: [
      "seo performance measurement framework",
      "organic traffic kpis",
      "content performance plan",
    ],
    searchIntent: "Informational",
    monthlyVolume: 50,
    topicBoundary:
      "Establishing baseline metrics, measurement cadences, and business KPI targets before rolling out new content libraries.",
  },
  "search-console-and-analytics-answer-different-questions": {
    slug: "search-console-and-analytics-answer-different-questions",
    path: "/blog/search-console-and-analytics-answer-different-questions/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "google search console vs google analytics for seo",
    secondaryKeywords: [
      "gsc impressions vs ga4 sessions",
      "search console queries vs user behavior",
      "traffic attribution differences",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Contrasting Google Search Console demand data (impressions, clicks, average position) with GA4 behavioral data (sessions, engagement, conversions).",
  },
  "calculate-percentage-growth-without-hiding-the-baseline": {
    slug: "calculate-percentage-growth-without-hiding-the-baseline",
    path: "/blog/calculate-percentage-growth-without-hiding-the-baseline/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "calculating organic traffic percentage growth",
    secondaryKeywords: [
      "seo baseline reporting",
      "percentage increase pitfalls",
      "accurate search reporting math",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Presenting percentage gains alongside absolute numerical baselines to prevent misleading stakeholders when starting from low numbers.",
  },
  "keep-missing-metrics-separate-from-zero": {
    slug: "keep-missing-metrics-separate-from-zero",
    path: "/blog/keep-missing-metrics-separate-from-zero/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "handling missing data in seo reporting",
    secondaryKeywords: [
      "missing metrics vs zero values",
      "data integrity in seo audits",
      "reporting null observations",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Distinguishing unmeasured or unavailable data from true zero values in performance reporting and analytics databases.",
  },
  "a-referral-traffic-worksheet-for-publication-campaigns": {
    slug: "a-referral-traffic-worksheet-for-publication-campaigns",
    path: "/blog/a-referral-traffic-worksheet-for-publication-campaigns/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "measuring referral traffic from guest posts",
    secondaryKeywords: [
      "guest blogging referral analytics",
      "tracking publisher traffic value",
      "utm tagging for contributed posts",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Tracking visitor engagement, bounce rates, and goal completions originating from external guest post referral links.",
  },
  "a-content-experiment-log-that-records-confounders": {
    slug: "a-content-experiment-log-that-records-confounders",
    path: "/blog/a-content-experiment-log-that-records-confounders/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "seo content ab test experiment log",
    secondaryKeywords: [
      "confounding factors in search testing",
      "measuring content changes",
      "controlled seo tests",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Accounting for external confounding variables (algorithm updates, seasonality, competitor launches) when running content split tests.",
  },
  "report-keyword-ideas-without-invented-demand-metrics": {
    slug: "report-keyword-ideas-without-invented-demand-metrics",
    path: "/blog/report-keyword-ideas-without-invented-demand-metrics/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "keyword research without misleading search volume",
    secondaryKeywords: [
      "responsible keyword reporting",
      "search demand validation",
      "keyword planner data accuracy",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Reporting qualitative customer search themes responsibly without fabricating estimated monthly search volumes for long-tail queries.",
  },
  "a-backlink-report-quality-check-before-analysis": {
    slug: "a-backlink-report-quality-check-before-analysis",
    path: "/blog/a-backlink-report-quality-check-before-analysis/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "backlink audit and referring domain quality check",
    secondaryKeywords: [
      "backlink profile audit",
      "filtering spammy referring domains",
      "link profile hygiene",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Cleaning raw backlink data exports: deduplicating site-wide links, filtering crawler artifacts, and assessing referring domain context.",
  },
  "choose-a-reporting-window-before-evaluating-content": {
    slug: "choose-a-reporting-window-before-evaluating-content",
    path: "/blog/choose-a-reporting-window-before-evaluating-content/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "seo performance reporting timeframes and seasonality",
    secondaryKeywords: [
      "choosing reporting periods seo",
      "seasonality in search data",
      "content evaluation windows",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Selecting appropriate evaluation timeframes (90 to 180 days) post-publication before declaring content successful or underperforming.",
  },
  "turn-an-seo-report-into-a-useful-next-action-list": {
    slug: "turn-an-seo-report-into-a-useful-next-action-list",
    path: "/blog/turn-an-seo-report-into-a-useful-next-action-list/",
    type: "blog",
    cluster: "Measurement",
    primaryKeyword: "actionable seo report recommendations roadmap",
    secondaryKeywords: [
      "prioritizing technical seo fixes",
      "turning audit into action items",
      "content roadmap execution",
    ],
    searchIntent: "Informational",
    topicBoundary:
      "Translating complex technical SEO audits into prioritized engineering tasks with estimated impact and clear owners.",
  },
};

/**
 * Helper to fetch keyword metadata for any guide or blog path or slug.
 */
export function getArticleKeywordData(
  pathOrSlug: string,
): ArticleKeywordEntry | undefined {
  const cleanSlug = pathOrSlug.replace(/^\/(guides|blog)\//, "").replace(/\/$/, "");
  return articleKeywordRegistry[cleanSlug];
}

/**
 * Returns all articles in the registry with path and type information.
 */
export function getAllArticleKeywordEntries(): ArticleKeywordEntry[] {
  return Object.values(articleKeywordRegistry);
}

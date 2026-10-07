# Original project brief (verbatim from owner, 2026-09-30)

> Source of truth for scope. Owner answers and decisions that refine this brief live in `docs/01-project-context.md`.

---

# PROJECT: Rebuild nameretailer.com from WordPress to Next.js (SEO-first, professional, with full admin panel)

## CONTEXT
I own https://nameretailer.com. It currently runs on WordPress and I DO NOT have the source files. Rebuild it from scratch in Next.js. The #1 priority is organic traffic: Google SEO, AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization: ChatGPT, Perplexity, Gemini, Google AI Overviews, Claude). The #2 priority is a clean, natural, professional, attractive, user-friendly design.

Business details (I will fill in what I know; ask me about anything missing before you build):
- Niche / what the site does: [FILL IN]
- Target audience and countries: [FILL IN]
- Main revenue model (ads, affiliate, leads, products): [FILL IN]
- Top 5 pages/posts that get traffic today: [FILL IN or "crawl and find out"]
- Brand colors / logo (if any): [FILL IN or "propose options"]
- WordPress export XML available? [YES/NO]

## TECH STACK
- Next.js (latest stable, App Router), TypeScript strict, React Server Components by default
- Tailwind CSS + shadcn/ui, next/font, next/image (AVIF/WebP)
- PostgreSQL + Prisma (or Drizzle), Auth.js for admin authentication
- Content in the database with a rich-text/Markdown editor (TipTap or similar), media stored in S3-compatible storage or Cloudinary
- ISR / static generation for public pages, on-demand revalidation when admin publishes
- Deployable on Vercel; include a .env.example and a README with setup steps

## HOW TO WORK: USE 4 SEPARATE SUBAGENTS
Create these as separate subagents in .claude/agents/ (each with its own focused system prompt and clear deliverables). You act as the orchestrator: run them, merge their outputs, resolve conflicts, and keep a shared /docs folder with each agent's report.

### Agent 1: KEYWORD RESEARCH AGENT (runs FIRST)
- Crawl the live nameretailer.com (sitemap.xml, robots.txt, all pages) and inventory every URL, title, meta description, H1, word count and internal links. Save as /docs/existing-site-audit.md and a CSV.
- Build a keyword strategy for my niche: primary/secondary/long-tail keywords, question-style keywords (People Also Ask), commercial vs informational intent, and local/regional variants if relevant.
- Group keywords into topic clusters (pillar page + supporting posts), map each keyword to exactly ONE target URL (avoid cannibalization), and produce a content calendar of new pages/posts to publish.
- Output: /docs/keyword-strategy.md and /docs/keyword-map.csv. Flag anything requiring paid tools (Ahrefs, Semrush, Search Console data) that I should provide, and do not invent search-volume numbers.

### Agent 2: SEO + AEO + GEO AGENT
Technical SEO:
- Metadata API for every route (unique title, description, canonical, Open Graph, Twitter cards), clean lowercase URLs, correct heading hierarchy (one H1)
- Dynamic sitemap.xml (with lastmod, split if large), robots.txt, hreflang if multi-language
- Structured data (JSON-LD): Organization, WebSite + SearchAction, BreadcrumbList, Article/BlogPosting, FAQPage, HowTo, Product/Review/ItemList (only where content genuinely supports it), Person for authors
- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1; Lighthouse 95+ on mobile for Performance, SEO, Accessibility, Best Practices
- Internal linking system (related posts, breadcrumbs, topic-cluster links), pagination handled correctly, no orphan pages, custom 404 that helps recovery, image alt text enforcement
- MIGRATION: 301 redirect map from every old WordPress URL to its new URL (/docs/redirect-map.csv, implemented in next.config and manageable from the admin panel). Preserve existing URL slugs wherever possible. Import content from the WordPress XML export if I have it; otherwise scrape and rebuild from the crawl.

AEO (answer engines, featured snippets, voice search):
- Answer-first content templates: a direct 40-60 word answer under each question heading, followed by depth
- FAQ blocks with FAQPage schema, definition boxes, step lists, comparison tables (snippet-friendly formats)
- Speakable/Q&A-style headings, concise summaries at the top of long articles

GEO (AI search / LLM citation):
- Clear entity signals: About page, author bios with credentials, Organization schema with sameAs links, consistent NAP/brand info
- E-E-A-T: visible authorship, publish/updated dates, sources and citations, editorial policy, contact page
- /llms.txt and /llms-full.txt describing the site and key pages; robots.txt that deliberately allows reputable AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) unless I say otherwise
- Content that is quotable and fact-dense: original data, definitions, stats with sources, up-to-date "last reviewed" dates
- Note honestly in the report that GEO has no guaranteed ranking factors; document what is best practice vs. experimental.

Output: /docs/seo-aeo-geo-implementation.md and a pre-launch SEO checklist.

### Agent 3: DESIGN AGENT
- Create a natural, professional, attractive, modern design system: color palette (accessible, WCAG AA contrast), typography (2 fonts max via next/font), spacing scale, components (header/mega-menu, hero, cards, CTAs, footers, breadcrumbs, author box, TOC, newsletter form, cookie banner)
- Fully responsive, mobile-first, light mode (dark mode optional), subtle motion only, no layout shift, no heavy sliders or popups that hurt SEO/UX
- Design tokens in Tailwind config; reusable components in /components; a /design-system preview page (noindex)
- Templates: Home, Category/Archive, Single Post/Article, Landing page, About, Contact, Search results, 404, Legal pages
- Avoid generic "template" look: pick a distinct visual direction fitting my niche and explain it in /docs/design-system.md

### Agent 4: USER-FRIENDLINESS (UX) + ACCESSIBILITY AGENT
- Define primary user journeys and conversion goals; simplify navigation (max 7 top-level items), sticky table of contents for long posts, fast on-site search with suggestions, clear CTAs
- Accessibility: semantic HTML, keyboard navigation, focus states, ARIA only where needed, WCAG 2.2 AA
- Reading experience: comfortable line length, scannable headings, key-takeaways box, estimated reading time, related content
- Forms: validation, spam protection (honeypot/Turnstile), clear success/error states; privacy/cookie consent (GDPR-friendly), no intrusive interstitials
- Review the Design and SEO agents' output, flag conflicts (e.g., ad/CTA placement vs. Core Web Vitals) and propose fixes
- Output: /docs/ux-review.md with prioritized issues, then verify fixes in the final build.

## ADMIN PANEL (/admin, fully built, secured, noindex)
Build a complete custom CMS replacing WordPress admin:
- Auth: secure login, roles (Admin, Editor, Author), password reset, session security, rate limiting, optional 2FA
- Dashboard: content stats, recent activity, SEO health warnings (missing meta, duplicate titles, missing alt text, orphan pages)
- Content: posts, pages, categories, tags, authors; rich editor with headings/tables/images/embeds; drafts, scheduled publishing, revisions/history, duplicate, bulk actions
- Per-page SEO panel: title, meta description (with live SERP preview and length counters), canonical, robots index/follow, OG image, focus keyword score, FAQ builder (auto JSON-LD), schema type selector, internal-link suggestions
- Media library: upload, auto-compress/convert to WebP/AVIF, required alt text, folders
- Redirect manager (301/302, bulk CSV import), 404 log with one-click "create redirect"
- Menu/navigation builder, homepage section manager, widgets/footer editor
- Site settings: logo, brand, social links, analytics/Search Console/tag IDs, robots.txt and llms.txt editors, sitemap controls
- Forms/leads inbox, comments moderation (optional), newsletter subscribers export
- Users management, audit log, backup/export (JSON/CSV/WXR)
- Clean, fast, user-friendly UI; every list has search, filter, sort and pagination

## SECURITY & QUALITY
- Input validation (zod), sanitized rich text, CSRF protection, secure headers/CSP, rate limiting, env-based secrets, no secrets in the repo
- Unit tests for critical logic, Playwright tests for key flows (login, publish, redirect, sitemap), ESLint + Prettier, CI config
- Analytics-ready: GA4 + Search Console verification, consent-aware

## EXECUTION PLAN (stop for my approval after each phase)
1. Ask me any missing questions, then run Agent 1 (audit + keywords)
2. Run Agents 3 & 4 (design system + UX plan), show me the design direction
3. Scaffold the project, database schema, auth, admin panel
4. Build public templates, migrate/import content, implement Agent 2's SEO/AEO/GEO layer + redirects
5. Full QA: Lighthouse, accessibility, schema validation (Rich Results Test), redirect tests, broken-link check
6. Deploy guide + launch-day checklist (DNS cutover, submit sitemap, monitor Search Console, 30-day post-launch watch)

## RULES
- Never invent facts, statistics, reviews, or authors; use clearly marked placeholder content where real content is missing
- Never fabricate keyword volumes; say what data is needed
- Keep all content original and human-quality (no thin or duplicate pages)
- Explain important decisions briefly; keep documentation in /docs

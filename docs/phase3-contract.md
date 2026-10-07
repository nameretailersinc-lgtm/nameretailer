# Phase 3 implementation contract

Approved 2026-10-05. Next.js 16 App Router, React 19, Tailwind 4, MongoDB native driver, stable Auth.js (next-auth 4, whose peers support Next 16/React 19). Owner explicitly replaced PostgreSQL/Drizzle with MongoDB and rejected embedded PostgreSQL. Both development and production use the private configured MongoDB connection. Tests use a dedicated test database, not the production content database. Never print connection strings or secrets.

## Shared wire contract (no database internals in client components)

`lib/cms/types.ts` exports `Collection`, `CmsRecord`, `Role`, `UserSummary`. Collections: `content`, `categories`, `tags`, `authors`, `media`, `redirects`, `notFound`, `menus`, `sections`, `widgets`, `leads`, `subscribers`. A record has `id`, `collection`, `title`, `slug`, `status`, `ownerId`, `data` (JSON object), `version`, `createdAt`, `updatedAt` (ISO strings). Common statuses: draft/published/scheduled/archived/pending/approved/rejected/new/read/subscribed/unsubscribed/active.

All APIs return `{ data: ... }` on success or `{ error: string, issues?: ... }`. `GET /api/admin/records/[collection]?q=&status=&sort=updatedAt|title|createdAt&direction=asc|desc&page=1&pageSize=20` returns `{data: CmsRecord[], total, page, pageSize}`. `POST` creates, `PATCH /api/admin/records/[collection]/[id]` updates with optimistic `version`, DELETE archives. Request body `{title,slug,status,data,version?}`; owner is server assigned. `POST .../[id]/duplicate`; `GET .../[id]/revisions`; `POST .../[id]/restore` body `{revisionId,version}`. Bulk `POST /api/admin/bulk` `{collection,ids,action:'publish'|'archive'|'delete'}`. Server enforces role/ownership/scheduling/publishing/slug constraints.

`GET /api/admin/dashboard` returns stats/recentActivity/warnings. `GET/PATCH /api/admin/settings` gets/saves a JSON object (admin only). `GET/POST /api/admin/users` and `PATCH /api/admin/users/[id]` manage name/email/role/active/password (never return password hashes); no deleting the last active admin. `GET /api/admin/audit` supports same query/pagination and returns audit rows. `GET /api/admin/export?format=json|csv|wxr&collection=content` downloads an export (admin only). `POST /api/admin/import/redirects` accepts `{csv}` and validates all rows atomically. `POST /api/admin/media` multipart fields `file`, `alt`, `folder`; produces optimized WebP+AVIF. `GET /media/[...path]` serves valid public media with no traversal.

`GET /api/admin/csrf` gives `{data:{token}}`; EVERY admin mutation includes `x-csrf-token` token and same-origin `Origin`. Cookies same-site and httpOnly. Auth.js own CSRF protects `/api/auth/*`. UI fetch helper obtains token first, includes it and handles 401/403/409/422 honestly. Login uses Auth.js `signIn('credentials',{email,password,redirect:false})`, logout `signOut`. Reset `POST /api/account/forgot-password` `{email}` (generic response); `POST /api/account/reset-password` `{token,password}`. Test/development captures mail in private `.local/mail/` only when `MAIL_TRANSPORT=local`; production requires SMTP for reset emails.

## Content payload (SEO agent owns validation)

`type`: post|page; `body`: sanitized HTML; `excerpt`; `authorId`; `categoryIds`, `tagIds`; `publishedAt`, `scheduledAt`, `lastReviewedAt` ISO strings; `seoTitle`, `metaDescription`, `canonical`, `robotsIndex`, `robotsFollow`, `ogImage`, `focusKeyword`, `schemaType` (WebPage|Article|BlogPosting|FAQPage|HowTo|ItemList|Service); `faq`: {question,answer}[]; `sources`: {label,url}[]; `relatedIds`: string[]. IDs optional until real entities exist; publishing requires a verified active author on posts and meaningful original content, not fabricated attribution. Do not silently populate public author identities from login users.

Other collection payloads: categories/tags `{description,parentId?}`; authors `{name,bio,credentials,url,sameAs[],verified:boolean}`; media `{alt,folder,url,avifUrl,width,height,mime,size}`; redirects `{source,target,statusCode:301|302,enabled:boolean}`; notFound `{path,count,lastSeenAt}`; menus `{location,items:[{label,url,children?}]}`; sections `{position,type,body,enabled}`; widgets `{location,body,enabled}`; leads `{email,message,consent}`; subscribers `{email,consent,consentedAt}`. Do not fake leads/subscriptions; Phase 4 wires public forms.

Settings: brandName/contactEmail/address/logo/socialLinks, ga4Id/gtmId/googleVerification/metaPixelId, robotsText/llmsText/llmsFullText, sitemapEnabled. Integration secrets stay environment-only, not exported. Auth roles admin/editor/author/customer. Authors only own content (drafts); editors content/taxonomies/authors/media; admins all. Admin pages private/no-store/noindex. Public templates, live redirect matching and SEO endpoints are Phase 4; here redirects are validated stored configuration only.

## File ownership

Root: package/toolchain, app layouts/server route wrappers, all API routes, db/auth/security/storage/queries/scripts/setup/deploy groundwork and integration verification.

Design agent: `components/**`, `app/globals.css`, `components.json`. Implement interactive admin screens on these contracts, root supplies route wrappers. Use TipTap, shadcn-style primitives, accessible native controls; no package/schema/SEO route changes.

SEO agent: `lib/cms/validation.ts`, `lib/cms/content.ts`, `lib/cms/exports.ts`, `lib/cms/redirects.ts`, `lib/seo/**`, their unit tests and phase3 SEO notes. Export schemas/functions explicitly to root. No public route activation or DB/auth changes.

UX agent: tests and documentation review after components/APIs exist. No source changes without assigned specific fix. Test auth/publish/media/redirect config/settings/list semantics at desktop/mobile; accessibility findings evidence, no unsupported conformance claim.
